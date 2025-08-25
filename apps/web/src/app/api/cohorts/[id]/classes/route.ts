import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const supabase = await createClient();

		const { data: classes, error } = await supabase
			.from("classes")
			.select(`
				*,
				teachers(
					id,
					first_name,
					last_name,
					email
				)
			`)
			.eq("cohort_id", id)
			.order("start_time", { ascending: true });

		if (error) {
			console.error("Error fetching classes:", error);
			return NextResponse.json(
				{ error: "Failed to fetch classes" },
				{ status: 500 }
			);
		}

		return NextResponse.json(classes || []);
	} catch (error) {
		console.error("Error in cohort classes GET:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}