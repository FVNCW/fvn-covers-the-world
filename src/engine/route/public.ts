import Elysia, { t } from "elysia";
import { db } from "../app";
import { sql, eq, inArray } from "drizzle-orm";
import { Characters, Illustrations, Objects, Specys } from "../schema/database";
import { generateSeed } from "../util/math";
import { apiState } from "../util/response";
import { fs } from "../lib/storage";
import { searchContent } from "../lib/search";
import { SearchBody } from "../schema/request";
import { imageContentType } from "../util/binary";

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
				return JSON.stringify(row ?? null);
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
		"/api/character/data/:id",
		async ({ params, set }) => {
			const [row] = await db.select().from(Characters).where(eq(Characters.id, params.id));
			if (!row) {
				set.status = 404;
				return apiState(false, "角色不存在");
			}
			return row;
		},
		{
			params: t.Object({ id: t.Integer() }),
		},
	)
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
		async ({ query }) => {
			// 混血判定：返回会产生混血冲突的物种两两配对
			const ids = Array.from(
				new Set(
					query.specy
						.map((v) => Number(v))
						.filter((n) => Number.isInteger(n) && n > 0),
				),
			);
			if (ids.length < 2) return [];

			const selected = await db.select().from(Specys).where(inArray(Specys.id, ids));
			const conflicts: { a: (typeof selected)[number]; b: (typeof selected)[number] }[] = [];
			for (let i = 0; i < selected.length; i++) {
				for (let j = i + 1; j < selected.length; j++) {
					const a = selected[i]!;
					const b = selected[j]!;
					if (a.conflictWith.includes(b.id) || b.conflictWith.includes(a.id)) {
						conflicts.push({ a, b });
					}
				}
			}
			return conflicts;
		},
		{
			query: t.Object({ specy: t.Array(t.String()) }),
		},
	)
	.post(
		"/api/search",
		async ({ body }) => {
			return await searchContent(body.type, body.condition);
		},
		{
			body: SearchBody,
		},
	);
