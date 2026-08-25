import Elysia from "elysia";
import { auth, db } from "../app";
import { characters } from "../schema/database";
import { character } from "../schema/request";

type GetSession = NonNullable<
    ReturnType<typeof auth.api.getSession> extends Promise<infer R> ? R : never
>;

export const authRoutes = new Elysia()
    .derive({ as: "scoped" }, async ({ request, set }): Promise<GetSession> => {
        const session = await auth.api.getSession(request);
        if (!session) {
            set.status = 401;
            return null!;
        }
        return { session: session.session, user: session.user };
    })
    .post(
        "/api/submit",
        async ({ body, user }) => {
            console.log(body, user);
            return await db
                .insert(characters)
                .values({
                    createdBy: user.id,
                    displayName: body.display_name,
                    personality: body.personality,
                })
                .returning();
        },
        { body: character },
    );
