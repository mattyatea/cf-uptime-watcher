import { createError, defineEventHandler, getHeader, toWebRequest } from "h3";
import { RPCHandler } from "@orpc/server/fetch";
import { router } from "../../router";
import { dbD1 } from "../../../database/drizzle/db";

const rpcHandler = new RPCHandler(router);

export default defineEventHandler(async (event) => {
  const env = (event.context.cloudflare?.env ?? {}) as Env;
  const request = toWebRequest(event);

  const { matched, response } = await rpcHandler.handle(request, {
    prefix: "/rpc",
    context: {
      db: dbD1(env.DB),
      password: env.AUTH_PASSWORD,
      authToken: getHeader(event, "authorization")?.replace("Bearer ", "") ?? null,
    },
  });

  if (matched) {
    return response;
  }

  throw createError({ statusCode: 404 });
});
