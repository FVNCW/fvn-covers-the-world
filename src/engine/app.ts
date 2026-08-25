import Elysia from "elysia";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "./env-load";
import * as schema from "./database/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";

export const app = new Elysia();
export const client = postgres(env.FCTW_POSTGRE_LOGON);
export const db = drizzle(client, { schema });
export const auth = betterAuth({
    database: drizzleAdapter(db, { provider: "pg" }),
    emailAndPassword: {
        enabled: true,
    },
    advanced: {
        cookiePrefix: "fctw_cookie",
    },
    baseURL: env.FCTW_BETTERAUTH,
});
