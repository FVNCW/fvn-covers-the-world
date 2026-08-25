import cors from "@elysiajs/cors";
import { app, auth } from "./app";
import { env } from "./env-load";

app.use(
    cors({
        origin: env.FCTW_CORS,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    }),
);
app.all("/api/auth/*", ({ request }) => auth.handler(request));
