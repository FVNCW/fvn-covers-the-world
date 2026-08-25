import Elysia, { t } from "elysia";
import { auth, db } from "../app";
import { Characters, Illustrations, Objects, Specys } from "../schema/database";
import { CharacterCreation } from "../schema/request";
import { and, eq, sql } from "drizzle-orm";
import { apiState } from "../util/response";
import { fs } from "../lib/storage";

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
        "/api/object/upload",
        async ({ body, user }) => {
            const { id, hash } = await fs.save(Buffer.from(body.data, "base64"));
            const [row] = await db
                .insert(Objects)
                .values({ id, hash, uploader: user.id })
                .returning();
            return row;
        },
        {
            body: t.Object({ data: t.String() }),
        },
    )
    .put(
        "/api/object/modify/:id",
        async ({ params, body, user, set }) => {
            const [existing] = await db
                .select()
                .from(Objects)
                .where(and(eq(Objects.id, params.id), eq(Objects.uploader, user.id)));
            if (!existing) {
                set.status = 404;
                return apiState(false, "对象不存在或无权限");
            }
            const hash = await fs.write(params.id, Buffer.from(body.data, "base64"));
            const [row] = await db
                .update(Objects)
                .set({ hash })
                .where(eq(Objects.id, params.id))
                .returning();
            return row;
        },
        {
            params: t.Object({ id: t.String() }),
            body: t.Object({ data: t.String() }),
        },
    )
    .delete(
        "/api/object/delete/:id",
        async ({ params, user, set }) => {
            const [existing] = await db
                .select()
                .from(Objects)
                .where(and(eq(Objects.id, params.id), eq(Objects.uploader, user.id)));
            if (!existing) {
                set.status = 404;
                return apiState(false, "对象不存在或无权限");
            }
            await db.delete(Objects).where(eq(Objects.id, params.id));
            await fs.delete(params.id);
            return apiState(true, "删除成功");
        },
        {
            params: t.Object({ id: t.String() }),
        },
    )
    .post(
        "/api/illustration/add",
        async ({ body, user, set }) => {
            const [target] = await db
                .select()
                .from(Characters)
                .where(and(eq(Characters.id, body.character), eq(Characters.createdBy, user.id)));
            if (!target) {
                set.status = 404;
                return apiState(false, "角色不存在或无权限");
            }
            const [created] = await db
                .insert(Illustrations)
                .values({
                    objectId: body.illustration.objectId,
                    displayName: body.illustration.displayName,
                    tags: body.illustration.tags,
                })
                .returning();
            await db
                .update(Characters)
                .set({
                    illustrations: sql`array_append(${Characters.illustrations}, ${created!.id})`,
                })
                .where(eq(Characters.id, body.character));
            return [created];
        },
        {
            body: t.Object({
                character: t.Number(),
                illustration: t.Object({
                    objectId: t.String(),
                    displayName: t.String(),
                    tags: t.Array(t.String()),
                }),
            }),
        },
    )
    .delete(
        "/api/illustration/delete/:id",
        async ({ params, set }) => {
            const [row] = await db
                .delete(Illustrations)
                .where(eq(Illustrations.id, Number(params.id)))
                .returning();
            if (!row) {
                set.status = 404;
                return apiState(false, "立绘不存在");
            }
            return row;
        },
        {
            params: t.Object({ id: t.String() }),
        },
    )
    .post(
        "/api/character/create",
        async ({ body, user }) => {
            const [row] = await db
                .insert(Characters)
                .values({
                    createdBy: user.id,
                    tags: body.tags,
                    illustrations: [],
                    displayName: body.displayName,
                    isDied: body.isDied,
                    isFemale: body.isFemale,
                    information: body.information,
                    specy: body.specy,
                    height: body.height,
                    length: body.length,
                    color: body.color,
                    relationShips: body.relationShips,
                })
                .returning();
            return [row];
        },
        { body: CharacterCreation },
    )
    .delete(
        "/api/character/delete",
        async ({ body, user, set }) => {
            const [row] = await db
                .delete(Characters)
                .where(and(eq(Characters.createdBy, user.id), eq(Characters.id, body.id)))
                .returning();
            if (!row) {
                set.status = 404;
                return apiState(false, "角色不存在");
            }
            return row;
        },
        {
            body: t.Object({
                id: t.Number(),
            }),
        },
    )
    .post(
        "/api/specy/create",
        async ({ body }) => {
            const [row] = await db
                .insert(Specys)
                .values({ parents: body.parents, displayName: body.displayName })
                .returning();
            return [row];
        },
        {
            body: t.Object({
                parents: t.Array(t.Number()),
                displayName: t.String(),
            }),
        },
    )
    .delete(
        "/api/specy/delete/:id",
        async ({ params, set }) => {
            const [row] = await db
                .delete(Specys)
                .where(eq(Specys.id, Number(params.id)))
                .returning();
            if (!row) {
                set.status = 404;
                return apiState(false, "节点不存在");
            }
            return row;
        },
        {
            params: t.Object({ id: t.String() }),
        },
    );
