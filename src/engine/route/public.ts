import Elysia, { t } from "elysia";
import { db } from "../app";
import { eq, gt, or, sql } from "drizzle-orm";
import { characters } from "../schema/database";
import { generateSeed } from "../util/math";

export const publicRoutes = new Elysia()
	.get("/api/today-character/:qid", async ({ params: { qid } }) => {
		return await db.transaction(async (tx) => {
			await tx.execute(sql`SELECT setseed(${generateSeed(qid)})`);
			const [row] = await tx.select()
				.from(characters)
				.orderBy(sql`random()`)
				.limit(1);
			return row;
		})
	}, {
		params: t.Object({
			qid: t.Numeric()
		})
	})
	.get("/api/characters", async ({ query: { created_by } }) => {
		return await db.select()
			.from(characters)
			.where(created_by ? eq(characters.createdBy, created_by) : sql`1=1`);
	}, {
		query: t.Object({
			created_by: t.String({ default: "" })
		})
	});
