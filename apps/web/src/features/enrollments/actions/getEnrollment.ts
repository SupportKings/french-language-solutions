"use server";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const uuidSchema = z
	.string()
	.regex(
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
		"Invalid UUID format",
	);

export async function getEnrollment(id: string) {
	// Validate id is a valid UUID
	const validationResult = uuidSchema.safeParse(id);

	if (!validationResult.success) {
		throw new Error(
			`Invalid enrollment ID format: ${validationResult.error.message}`,
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
		console.error("Error fetching enrollment:", error);
		throw new Error("Failed to load enrollment");
	}

	return data;
}
