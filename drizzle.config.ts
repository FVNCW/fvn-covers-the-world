import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "src/engine/schema/database.ts",
    out: "./drizzle/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.FCTW_POSTGRE_LOGON!,
    },
    verbose: true,
    strict: true,
});
