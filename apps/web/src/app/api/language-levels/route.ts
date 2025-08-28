import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { sortLanguageLevels } from "@/features/language-levels/utils/sorting";

export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();

		// Fetch all language levels
		const { data: levels, error } = await supabase
			.from("language_levels")
			.select("*");

		if (error) {
			console.error("Error fetching language levels:", error);
			return NextResponse.json(
				{ error: "Failed to fetch language levels" },
				{ status: 500 },
			);
		}

		// Sort levels with natural sorting to handle A1.2 vs A1.11 correctly
		const sortedLevels = sortLanguageLevels(levels || []);

		return NextResponse.json({
			data: sortedLevels,
			meta: {
				total: sortedLevels.length,
			},
		});
	} catch (error) {
		console.error("Error fetching language levels:", error);
		return NextResponse.json(
			{ error: "Failed to fetch language levels" },
			{ status: 500 },
		);
	}
}
