import Elysia, { t } from "elysia";
import { db } from "../app";
import { sql } from "drizzle-orm";
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
	});
