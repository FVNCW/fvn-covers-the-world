import Elysia, { t } from "elysia";
import { db } from "../app";
import { sql } from "drizzle-orm";
import { characters } from "../schema/database";
import { generateSeed } from "../util/math";

export const publicRoutes = new Elysia()
    .get(
        "/api/character/today",
        async ({ query: { seed } }) => {
            return await db.transaction(async (tx) => {
                await tx.execute(sql`SELECT setseed(${generateSeed(seed)})`);
                const [row] = await tx
                    .select()
                    .from(characters)
                    .orderBy(sql`random()`)
                    .limit(1);
                return row;
            });
        },
        {
            query: t.Object({
                seed: t.String(),
            }),
        },
    )
    .get("/api/character/list", async () => {
        return await db.select().from(characters);
    });
