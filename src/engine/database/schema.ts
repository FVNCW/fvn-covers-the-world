import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const characters = pgTable("characters", {
    id: serial("id").primaryKey(),
    displayName: text("display_name").notNull(),
    createdBy: text("created_by").notNull(),
});
