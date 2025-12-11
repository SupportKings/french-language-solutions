import { createClient } from "@/lib/supabase/server";

export interface CohortOption {
	id: string;
	nickname: string | null;
}

export async function getAllCohortsForSelection() {
	const supabase = await createClient();

	// Fetch all cohorts without filtering by messages
	const { data: cohorts, error } = await supabase
		.from("cohorts")
		.select("id, nickname")
		.order("created_at", { ascending: false });

	if (error) {
		console.error("❌ Error fetching cohorts for selection:", error);
		throw new Error(`Failed to fetch cohorts: ${error.message}`);
	}

	return cohorts || [];
}
