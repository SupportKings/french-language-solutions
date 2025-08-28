import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		
		// Fetch all language levels ordered by levelGroup and levelNumber
		const { data: levels, error } = await supabase
			.from("language_levels")
			.select("*")
			.order("level_group", { ascending: true })

		if (error) {
			console.error("Error fetching language levels:", error);
			return NextResponse.json(
				{ error: "Failed to fetch language levels" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			data: levels || [],
			meta: {
				total: levels?.length || 0,
			},
		});
	} catch (error) {
		console.error("Error fetching language levels:", error);
		return NextResponse.json(
			{ error: "Failed to fetch language levels" },
			{ status: 500 }
		);
	}
}