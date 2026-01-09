"use server";

import { requireAuth } from "@/lib/rbac-middleware";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";

export const fetchTeachersForSelect = actionClient.action(async () => {
	await requireAuth();
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("teachers")
		.select("id, full_name")
		.eq("onboarding_status", "onboarded")
		.order("full_name");

	if (error) {
		throw new Error("Failed to fetch teachers");
	}

	return data || [];
});
