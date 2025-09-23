import "dotenv/config";

import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./lib/config";
import { createContext } from "./lib/context";
import classBookingRoutes from "./modules/class-booking/routes";
import followUpRoutes from "./modules/follow-ups/routes";
// Import API modules
import studentsRoutes from "./modules/students/routes";
import teachersRoutes from "./modules/teachers/routes";
import { appRouter } from "./routers/index";

const app = new Hono();

// Debug: Check if env variable is loaded

// Apply CORS globally
const corsMiddleware = cors({
	origin: (origin) => {
		// No origin (server-to-server) - return null to omit CORS headers
		if (!origin) return null;

		// Normalize origins by removing trailing slashes
		const normalizeOrigin = (url: string) => url.replace(/\/$/, "");
		const normalizedOrigin = normalizeOrigin(origin);

		const allowedOrigins = [
			env.CORS_ORIGIN,
			env.SUPABASE_URL,
			// Add any additional allowed origins here
		]
			.filter(Boolean)
			.map((url) => normalizeOrigin(url as string));

		// Strict equality check - no partial matches
		if (allowedOrigins.includes(normalizedOrigin)) {
			return origin;
		}

		return null; // Reject the origin
	},
	allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowHeaders: ["Content-Type", "Authorization", "apikey", "x-client-info"],
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
app.route("/api/teachers", teachersRoutes);

// Health check endpoint
app.get("/health", (c) => {
	return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/", (c) => {
	return c.text("OK");
});

// Global error handler
app.onError((err, c) => {
	console.error(`Error: ${err.message}`, err);
	return c.json({ error: "Internal Server Error" }, 500);
});

// 404 handler
app.notFound((c) => {
	return c.json({ error: "Not Found" }, 404);
});

const port = Number(env.PORT);

console.log(`🚀 Server configured to run on port ${port}`);
console.log(`📝 Environment: ${env.NODE_ENV}`);
console.log(`🔗 CORS origins: ${env.CORS_ORIGIN}`);

export default {
	port,
	fetch: app.fetch,
};
