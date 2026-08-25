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
	},
	baseURL: env.FCTW_BETTERAUTH,
	trustedOrigins: [env.FCTW_CORS]
});
