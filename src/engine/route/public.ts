import Elysia, { t } from "elysia";
import { db } from "../app";
import { sql, eq } from "drizzle-orm";
import { Characters, Illustrations, Objects, Specys } from "../schema/database";
import { generateSeed } from "../util/math";
import { apiState } from "../util/response";
import { fs } from "../lib/storage";

function imageContentType(data: Buffer): string {
    if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47)
        return "image/png";
    if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return "image/jpeg";
    if (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46) return "image/gif";
    if (data[0] === 0x52 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x46)
        return "image/webp";
    return "application/octet-stream";
}

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
            const data = await fs.read(params.id);
            if (!data) {
                set.status = 404;
                return apiState(false, "对象文件不存在");
            }
            set.headers["content-type"] = imageContentType(data);
            return data;
        },
        {
            params: t.Object({ id: t.String() }),
        },
    )
    .get(
        "/api/object/metadata/:id",
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
        },
    )
    .get("/api/object/list", async () => {
        return await db.select().from(Objects);
    })
    .get("/api/illustration/list", async () => {
        return await db.select().from(Illustrations);
    })
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
