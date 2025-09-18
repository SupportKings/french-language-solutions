import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const supabase = await createClient();

		const { data: cohort, error } = await supabase
			.from("cohorts")
			.select(`
				*,
				products(
					id,
					display_name,
					location,
					format,
					signup_link_for_self_checkout,
					pandadoc_contract_template_id
				)
			`)
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching cohort:", error);
			return NextResponse.json(
				{ error: "Failed to fetch cohort" },
				{ status: 500 },
			);
		}

		if (!cohort) {
			return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
		}

		return NextResponse.json(cohort);
	} catch (error) {
		console.error("Error in cohort GET:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const body = await request.json();
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("cohorts")
			.update(body)
			.eq("id", id)
			.select(`
				*,
				products(
					id,
					display_name,
					location,
					format,
					signup_link_for_self_checkout,
					pandadoc_contract_template_id
				)
			`)
			.single();

		if (error) {
			console.error("Error updating cohort:", error);
			return NextResponse.json(
				{ error: "Failed to update cohort" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in cohort PATCH:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const supabase = await createClient();

		// First, delete all related records in order of dependency

		// 1. Delete attendance records for classes in this cohort
		const { data: classes } = await supabase
			.from("classes")
			.select("id")
			.eq("cohort_id", id);

		if (classes && classes.length > 0) {
			const classIds = classes.map((c) => c.id);
			const { error: attendanceError } = await supabase
				.from("attendance_records")
				.delete()
				.in("class_id", classIds);

			if (attendanceError) {
				console.error("Error deleting attendance records:", attendanceError);
			}
		}

		// 2. Delete classes
		const { error: classesError } = await supabase
			.from("classes")
			.delete()
			.eq("cohort_id", id);

		if (classesError) {
			console.error("Error deleting classes:", classesError);
		}

		// 3. Delete weekly sessions
		const { error: sessionsError } = await supabase
			.from("weekly_sessions")
			.delete()
			.eq("cohort_id", id);

		if (sessionsError) {
			console.error("Error deleting weekly sessions:", sessionsError);
			return NextResponse.json(
				{ error: "Failed to delete cohort weekly sessions" },
				{ status: 500 },
			);
		}

		// 4. Delete enrollments
		const { error: enrollmentsError } = await supabase
			.from("enrollments")
			.delete()
			.eq("cohort_id", id);

		if (enrollmentsError) {
			console.error("Error deleting enrollments:", enrollmentsError);
		}

		// 5. Finally, delete the cohort itself
		const { error } = await supabase.from("cohorts").delete().eq("id", id);

		if (error) {
			console.error("Error deleting cohort:", error);
			return NextResponse.json(
				{ error: "Failed to delete cohort" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error in cohort DELETE:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
