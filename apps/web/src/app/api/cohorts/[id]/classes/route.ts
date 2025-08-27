import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const supabase = await createClient();

		// First get all classes for the cohort
		const { data: classes, error } = await supabase
			.from("classes")
			.select(`
				*,
				teachers(id, first_name, last_name)
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

		// Then get attendance count for each class
		const classesWithAttendance = await Promise.all(
			(classes || []).map(async (classItem) => {
				const { count } = await supabase
					.from("attendance_records")
					.select("*", { count: "exact", head: true })
					.eq("class_id", classItem.id)
					.eq("status", "attended");
				
				return {
					...classItem,
					attendance_count: count || 0
				};
			})
		);

		return NextResponse.json(classesWithAttendance || []);
	} catch (error) {
		console.error("Error in cohort classes GET:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}