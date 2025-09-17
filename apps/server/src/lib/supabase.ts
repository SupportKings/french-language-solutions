import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
	throw new Error("Missing Supabase environment variables");
}

// Create a Supabase client with service role key for server-side operations
export const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false
	}
});

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any): { success: false; error: string } {
	console.error("Supabase error:", error);
	return {
		success: false,
		error: error?.message || "Database operation failed"
	};
}