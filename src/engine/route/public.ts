import Elysia, { t } from "elysia";
import { db } from "../app";
import { sql, eq } from "drizzle-orm";
import { Characters, Objects, Specys } from "../schema/database";
import { generateSeed } from "../util/math";
import { apiState } from "../util/response";

export const publicRoutes = new Elysia()
    .get(
        "/api/character/today",
        async ({ query: { seed } }) => {
            return await db.transaction(async (tx) => {
                await tx.execute(sql`SELECT setseed(${generateSeed(seed ?? "")})`);
                const [row] = await tx
                    .select()
                    .from(Characters)
                    .orderBy(sql`random()`)
                    .limit(1);
                return row;
            });
        },
        {
            query: t.Object({
                seed: t.Optional(t.String()),
            }),
        },
    )
    .get("/api/character/list", async () => {
        return await db.select().from(Characters);
    })
    .get(
        "/api/object/download/:id",
        async ({ params, set }) => {
            const [row] = await db.select().from(Objects).where(eq(Objects.id, params.id));
            if (!row) {
                set.status = 404;
                return apiState(false, "对象不存在");
            }
            return row;
        },
        {
            params: t.Object({ id: t.String() }),
            query: t.Object({ type: t.Optional(t.Literal("info")) }),
        },
    )
    .get("/api/specy/list", async () => {
        return await db.select().from(Specys);
    })
    .get(
        "/api/specy/try-mix",
        async () => {
            // 混血判定逻辑待文档定义，暂时返回空数组
            return [];
        },
        {
            query: t.Object({ specy: t.Array(t.String()) }),
        },
    );