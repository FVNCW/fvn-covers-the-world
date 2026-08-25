import Elysia from "elysia";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

export const app = new Elysia();
export const client = postgres();
export const db = drizzle(client);
