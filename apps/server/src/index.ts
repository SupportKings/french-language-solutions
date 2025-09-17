import "dotenv/config";

import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createContext } from "./lib/context";
import { appRouter } from "./routers/index";

// Import API modules
import studentsRoutes from "./modules/students/routes";
import classBookingRoutes from "./modules/class-booking/routes";
import followUpRoutes from "./modules/follow-ups/routes";

const app = new Hono();

// Debug: Check if env variable is loaded

// Apply CORS globally
const corsMiddleware = cors({
	origin: process.env.CORS_ORIGIN || "",
	allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowHeaders: ["Content-Type", "Authorization"],
	credentials: true,
});

app.use("*", logger());
app.use("*", corsMiddleware);

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	}),
);

// Mount API routes
app.route("/api/students", studentsRoutes);
app.route("/api/class-booking", classBookingRoutes);
app.route("/api/follow-ups", followUpRoutes);

app.get("/", (c) => {
	return c.text("OK");
});

export default app;
