import Elysia, { t } from "elysia";
import { auth, db } from "../app";
import { characters } from "../schema/database";
import { character } from "../schema/request";
import { and, eq } from "drizzle-orm";

type GetSession = NonNullable<
	ReturnType<typeof auth.api.getSession> extends Promise<infer R> ? R : never
>;

export const authRoutes = new Elysia()
	.derive({ as: "scoped" }, async ({ request, set }): Promise<GetSession> => {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session) {
			set.status = 401;
			throw new Error("未登录");
		}
		return { session: session.session, user: session.user };
	})
	.post(
		"/api/submit",
		async ({ body, user }) => {
			return db
				.insert(characters)
				.values({
					createdBy: user.id,
					displayName: body.display_name,
					personality: body.personality,
				})
				.returning();
		},
		{ body: character },
	)
	.delete("/api/unsubmit", async ({ body, user }) => {
		return await db
			.delete(characters)
			.where(and(eq(characters.createdBy, user.id), eq(characters.id, body.id)))
			.returning();
	}, {
		body: t.Object({
			id: t.Number()
		})
	});
