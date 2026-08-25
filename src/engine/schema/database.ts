import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const characters = pgTable("characters", {
    id: serial("id").primaryKey(),
    createdBy: text("created_by").notNull(),
    displayName: text("display_name").notNull(),
    personality: text("personality").notNull(),
});
