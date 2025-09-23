import { z } from "zod";

const envSchema = z.object({
	PORT: z.string().optional().default("3000"),
	DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
	CORS_ORIGIN: z.string().optional().default("http://localhost:3001"),
	SUPABASE_URL: z.string().min(1, "SUPABASE_URL is required"),
	SUPABASE_SERVICE_ROLE_KEY: z
		.string()
		.min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.optional()
		.default("development"),
	// Legacy/unused - kept for compatibility but not required
	NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
	SUPABASE_ANON_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
	try {
		return envSchema.parse(process.env);
	} catch (error) {
		console.error("❌ Invalid environment variables:");
		if (error instanceof z.ZodError) {
			for (const issue of error.issues) {
				console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
			}
		}
		process.exit(1);
	}
}

export const env = validateEnv();
