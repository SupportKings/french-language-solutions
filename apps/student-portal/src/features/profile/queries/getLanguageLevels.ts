import { createClient } from "@/lib/supabase/server";
import { sortLanguageLevels } from "../utils/sortLanguageLevels";

export async function getLanguageLevels() {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("language_levels")
		.select("id, code, display_name, level_number, level_group");

	if (error) {
		throw error;
	}

	// Apply natural sorting to handle A1.2 vs A1.11 correctly
	return sortLanguageLevels(data);
}
