import { RPCHandler } from "@orpc/server/fetch";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { apply, serve } from "@photonjs/hono";
import { Hono } from "hono";
import { dbD1 } from "../database/drizzle/db";
import * as mnQueries from "../database/drizzle/queries/monitor-notifications";
import * as queries from "../database/drizzle/queries/monitors";
import * as channelQueries from "../database/drizzle/queries/notification-channels";
import { performCheck } from "./check";
import { dbMiddleware } from "./db-middleware";
import { buildNotifiersFromChannels, sendNotifications } from "./notifiers";
import { router } from "./router";

function createApp() {
  const app = new Hono<{ Bindings: Env }>();

  const rpcHandler = new RPCHandler(router);
  const openApiHandler = new OpenAPIHandler(router, {
    plugins: [
      new OpenAPIReferencePlugin({
        docsPath: "/openapi",
        specPath: "/openapi/spec.json",
        docsTitle: "CF Healthcheck API Reference",
        schemaConverters: [new ZodToJsonSchemaConverter()],
        specGenerateOptions: {
          info: {
            title: "CF Healthcheck API",
            version: "1.0.0",
            description:
              "REST API for monitors, check history, authentication, and notification channel management.",
          },
          components: {
            securitySchemes: {
              bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "Bearer <AUTH_PASSWORD>",
                description:
                  "Use the same password as the web UI login as a Bearer token for protected endpoints.",
              },
            },
          },
        },
      }),
    ],
  });

  app.use("/rpc/*", async (c) => {
    const { matched, response } = await rpcHandler.handle(c.req.raw, {
      prefix: "/rpc",
      context: {
        db: dbD1(c.env.DB),
        password: c.env.AUTH_PASSWORD,
        authToken: c.req.header("authorization")?.replace("Bearer ", "") ?? null,
      },
    });

    if (matched) {
      return c.newResponse(response.body, response);
    }

    return c.notFound();
  });

  app.use("/api/*", async (c) => {
    const { matched, response } = await openApiHandler.handle(c.req.raw, {
      prefix: "/api",
      context: {
        db: dbD1(c.env.DB),
        password: c.env.AUTH_PASSWORD,
        authToken: c.req.header("authorization")?.replace("Bearer ", "") ?? null,
      },
    });

    if (matched) {
      return c.newResponse(response.body, response);
    }

    return c.notFound();
  });

  apply(app, [dbMiddleware]);

  return app;
}

function createWorker() {
  const app = createApp();
  const worker = serve(app) as unknown as Record<string, unknown>;

  // Add Cloudflare Cron Trigger handler
  worker.scheduled = async (_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) => {
    const db = dbD1(env.DB);
    const monitors = await queries.getActiveMonitors(db);
    const allChannels = await channelQueries.getActiveChannels(db);

    await Promise.allSettled(
      monitors.map(async (monitor) => {
        const previousCheck = await queries.getLatestCheckResult(db, monitor.id);
        const previouslyUp = previousCheck?.isUp ?? true;

        const result = await performCheck(monitor);
        await queries.insertCheckResult(db, {
          monitorId: monitor.id,
          ...result,
        });

        // Log errors
        if (!result.isUp) {
          console.error(
            `[CHECK FAILED] ${monitor.name} (${monitor.url}): ${result.statusCode ?? "N/A"} - ${result.errorMessage ?? "Unknown error"}`,
          );
        }

        // Notify only on state change, using monitor-specific channels
        const stateChanged = previouslyUp !== result.isUp;
        if (stateChanged) {
          const linkedChannelIds = await mnQueries.getChannelIdsForMonitor(db, monitor.id);
          const channelIdSet = new Set(linkedChannelIds.map((r) => r.channelId));
          const monitorChannels = allChannels.filter((ch) => channelIdSet.has(ch.id));

          if (monitorChannels.length > 0) {
            const notifiers = buildNotifiersFromChannels(monitorChannels);
            await sendNotifications(notifiers, { monitor, result, previouslyUp });
          }
        }
      }),
    );
  };

  return worker;
}

export default createWorker() as unknown;
