import { createClient } from "@supabase/supabase-js";
import { env } from "./config";
import type { Database } from "./database.types";

// Use validated environment variables - no fallbacks to prevent privilege downgrades
const supabaseUrl = env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

// These are required by the env schema, but double-check to be explicit
if (!supabaseUrl || !supabaseServiceKey) {
	throw new Error(
		"SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. No anon key fallback allowed for security.",
	);
}

// Create a Supabase client with service role key for server-side operations
export const supabase = createClient<Database>(
	supabaseUrl,
	supabaseServiceKey,
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	},
);

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any): {
	success: false;
	error: string;
} {
	console.error("Supabase error:", error);
	return {
		success: false,
		error: error?.message || "Database operation failed",
	};
}
