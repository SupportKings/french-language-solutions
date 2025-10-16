import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { z } from "zod";

interface RouteParams {
	params: Promise<{ id: string }>;
}

const uuidSchema = z
	.string()
	.regex(
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
		"Invalid UUID format",
	);

// GET /api/enrollments/[id] - Get a single enrollment
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		// Validate UUID format
		const validationResult = uuidSchema.safeParse(id);
		if (!validationResult.success) {
			return NextResponse.json(
				{ error: "Invalid enrollment ID format" },
				{ status: 400 },
			);
		}

		const supabase = await createClient();

		const { data, error } = await supabase
			.from("enrollments")
			.select(`
				*,
				student:students!enrollments_student_id_students_id_fk (
					id,
					full_name,
					first_name,
					last_name,
					email,
					mobile_phone_number,
					city,
					communication_channel,
					initial_channel,
					is_full_beginner,
					is_under_16,
					purpose_to_learn,
					subjective_deadline_for_student,
					website_quiz_submission_date,
					created_at,
					updated_at
				),
				cohort:cohorts!enrollments_cohort_id_cohorts_id_fk (
					id,
					nickname,
					cohort_status,
					start_date,
					max_students,
					room_type,
					product:products!cohorts_product_id_products_id_fk (
						id,
						display_name,
						format,
						location
					),
					starting_level:language_levels!cohorts_starting_level_id_language_levels_id_fk (
						id,
						display_name,
						code,
						level_group
					),
					current_level:language_levels!cohorts_current_level_id_language_levels_id_fk (
						id,
						display_name,
						code,
						level_group
					),
					weekly_sessions:weekly_sessions!weekly_sessions_cohort_id_cohorts_id_fk (
						id,
						day_of_week,
						start_time,
						end_time,
						teacher:teachers!weekly_sessions_teacher_id_teachers_id_fk (
							id,
							first_name,
							last_name
						)
					)
				)
			`)
			.eq("id", id)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Enrollment not found" },
					{ status: 404 },
				);
			}
			// Check for permission denied - PGRST301 or 42501
			if (error.code === "PGRST301" || error.code === "42501") {
				return NextResponse.json(
					{ error: "You don't have permission to view this enrollment" },
					{ status: 403 },
				);
			}
			console.error("Error fetching enrollment:", error);
			return NextResponse.json(
				{ error: "Failed to fetch enrollment" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in GET /api/enrollments/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// PATCH /api/enrollments/[id] - Update an enrollment
export async function PATCH(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const supabase = await createClient();
		const body = await request.json();

		const updateData = {
			...(body.status && { status: body.status }),
			...(body.cohortId && { cohort_id: body.cohortId }),
			updated_at: new Date().toISOString(),
		};

		const { data, error } = await supabase
			.from("enrollments")
			.update(updateData)
			.eq("id", id)
			.select(`
				*,
				students(id, full_name, email),
				cohorts(
					id, 
					starting_level_id,
					current_level_id,
					start_date,
					room_type,
					cohort_status,
					max_students,
					products(
						id,
						format,
						display_name
					),
					starting_level:language_levels!starting_level_id(
						id,
						code,
						display_name
					),
					current_level:language_levels!current_level_id(
						id,
						code,
						display_name
					)
				)
			`)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Enrollment not found" },
					{ status: 404 },
				);
			}
			console.error("Error updating enrollment:", error);
			return NextResponse.json(
				{ error: "Failed to update enrollment" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in PATCH /api/enrollments/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// DELETE /api/enrollments/[id] - Delete an enrollment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const supabase = await createClient();

		const { error } = await supabase.from("enrollments").delete().eq("id", id);

		if (error) {
			console.error("Error deleting enrollment:", error);
			return NextResponse.json(
				{ error: "Failed to delete enrollment" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ message: "Enrollment deleted successfully" });
	} catch (error) {
		console.error("Error in DELETE /api/enrollments/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
