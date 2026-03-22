import { integer, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";
import { monitorTable } from "./monitors";
import { notificationChannelTable } from "./notification-channels";

export const monitorNotificationTable = sqliteTable(
  "monitor_notifications",
  {
    monitorId: integer("monitor_id")
      .notNull()
      .references(() => monitorTable.id, { onDelete: "cascade" }),
    channelId: integer("channel_id")
      .notNull()
      .references(() => notificationChannelTable.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.monitorId, table.channelId] })],
);
