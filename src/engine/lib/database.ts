import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../schema/database";
import { env } from "../env-load";

export const client = postgres(env.FCTW_POSTGRE_LOGON);
export const db = drizzle(client, { schema });
