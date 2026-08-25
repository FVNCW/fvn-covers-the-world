import { pgTable, serial, text, integer, boolean, jsonb, doublePrecision } from "drizzle-orm/pg-core";

export const Objects = pgTable("objects", {
    id: text("id").primaryKey(),
    hash: text("hash").notNull(),
    uploader: text("uploader").notNull(),
});

export const Illustrations = pgTable("illustrations", {
    id: serial("id").primaryKey(),
    objectId: text("object_id").notNull(),
    displayName: text("display_name").notNull(),
    tags: text("tags").array().notNull(),
});

export const Specys = pgTable("specys", {
    id: serial("id").primaryKey(),
    displayName: text("display_name").notNull(),
    parents: integer("parents").array().notNull(),
});

export const Characters = pgTable("characters", {
    id: serial("id").primaryKey(),
    createdBy: text("created_by").notNull(),
    tags: text("tags").array().notNull(),
    illustrations: integer("illustrations").array().notNull(),
    displayName: text("display_name").notNull(),
    isDied: boolean("is_died").notNull(),
    isFemale: boolean("is_female").notNull(),
    information: jsonb("information").notNull(),
    specy: jsonb("specy").notNull(),
    height: doublePrecision("height").notNull(),
    length: doublePrecision("length").notNull(),
    color: jsonb("color").notNull(),
    relationShips: jsonb("relation_ships").notNull(),
});

export * from "./auth";