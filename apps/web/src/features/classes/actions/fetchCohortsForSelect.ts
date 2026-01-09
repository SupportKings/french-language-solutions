"use server";

import { requireAuth } from "@/lib/rbac-middleware";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";

export const fetchCohortsForSelect = actionClient.action(async () => {
	await requireAuth();
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("cohorts")
		.select("id, starting_level, start_date")
		.order("created_at", { ascending: false });

	if (error) {
		throw new Error("Failed to fetch cohorts");
	}

	return data || [];
});
