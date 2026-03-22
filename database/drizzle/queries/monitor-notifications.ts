import { eq, and } from "drizzle-orm";
import type { dbD1 } from "../db";
import { monitorNotificationTable } from "../schema/monitor-notifications";

type DB = ReturnType<typeof dbD1>;

export function getChannelIdsForMonitor(db: DB, monitorId: number) {
  return db
    .select({ channelId: monitorNotificationTable.channelId })
    .from(monitorNotificationTable)
    .where(eq(monitorNotificationTable.monitorId, monitorId))
    .all();
}

export async function setChannelsForMonitor(db: DB, monitorId: number, channelIds: number[]) {
  await db
    .delete(monitorNotificationTable)
    .where(eq(monitorNotificationTable.monitorId, monitorId));

  if (channelIds.length > 0) {
    await db
      .insert(monitorNotificationTable)
      .values(channelIds.map((channelId) => ({ monitorId, channelId })));
  }
}

export function removeChannelFromAllMonitors(db: DB, channelId: number) {
  return db
    .delete(monitorNotificationTable)
    .where(eq(monitorNotificationTable.channelId, channelId));
}

export function addChannelToMonitor(db: DB, monitorId: number, channelId: number) {
  return db.insert(monitorNotificationTable).values({ monitorId, channelId }).onConflictDoNothing();
}

export function removeChannelFromMonitor(db: DB, monitorId: number, channelId: number) {
  return db
    .delete(monitorNotificationTable)
    .where(
      and(
        eq(monitorNotificationTable.monitorId, monitorId),
        eq(monitorNotificationTable.channelId, channelId),
      ),
    );
}
