import cors from "@elysiajs/cors";
import { app, auth } from "./app";
import { env } from "./env-load";
import { authRoutes } from "./route/auth";

app
	.use(
		cors({
			origin: env.FCTW_CORS,
			methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	.mount(auth.handler)
	.use(authRoutes);
