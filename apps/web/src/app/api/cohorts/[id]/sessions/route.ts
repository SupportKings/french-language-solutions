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
				),
				weekly_sessions(
					id,
					teacher_id,
					day_of_week,
					start_time,
					end_time,
					google_calendar_event_id,
					teachers(
						id,
						first_name,
						last_name,
						mobile_phone_number,
						available_for_online_classes,
						available_for_in_person_classes
					)
				)
			`)
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching cohort with sessions:", error);
			return NextResponse.json(
				{ error: "Failed to fetch cohort with sessions" },
				{ status: 500 },
			);
		}

		if (!cohort) {
			return NextResponse.json({ error: "Cohort not found" }, { status: 404 });
		}

		return NextResponse.json(cohort);
	} catch (error) {
		console.error("Error in cohort sessions GET:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id: cohortId } = await params;
		const body = await request.json();
		const supabase = await createClient();

		// Validate required fields
		const { teacher_id, day_of_week, start_time, end_time } = body;

		if (!teacher_id || !day_of_week || !start_time || !end_time) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// Create the weekly session
		const { data, error } = await supabase
			.from("weekly_sessions")
			.insert({
				cohort_id: cohortId,
				teacher_id,
				day_of_week,
				start_time,
				end_time,
				google_calendar_event_id: body.google_calendar_event_id || null,
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating weekly session:", error);
			return NextResponse.json(
				{ error: "Failed to create weekly session" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		console.error("Error in weekly session POST:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
