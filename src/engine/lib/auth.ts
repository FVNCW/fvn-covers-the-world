import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "../env-load";
import { db } from "./database";

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
});
