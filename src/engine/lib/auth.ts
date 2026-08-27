import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "../env-load";
import { db } from "./database";
import { customSession } from "better-auth/plugins";
import { user as userTable } from "../schema/database";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
    database: drizzleAdapter(db, { provider: "pg" }),
    emailAndPassword: {
        enabled: true,
    },
    advanced: {
        cookiePrefix: "fctw_cookie",
        defaultCookieAttributes: {
            sameSite: "None",
            secure: true,
            httpOnly: true,
            path: "/",
        },
    },
    baseURL: env.FCTW_BETTERAUTH_URL,
    secret: env.FCTW_BETTERAUTH_SECRET,
    trustedOrigins: [env.FCTW_CORS],
    user: {
        additionalFields: {
            avatarId: {
                type: "string",
                input: false
            }
        }
    },
    plugins: [
        customSession(async ({ user, session }) => {
            let avatarId = null;
            const [row] = await db.select().from(userTable).where(eq(userTable.id, user.id));
            if (row) {
                avatarId = row.avatarId;
            }
            return {
                user: {
                    ...user,
                    avatarId
                },
                session
            };
        })
    ]
});
