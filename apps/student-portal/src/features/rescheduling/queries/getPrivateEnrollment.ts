import { createClient } from "@/lib/supabase/server";

import type { PrivateEnrollment, WeeklySession } from "../types";

// Enrollment statuses that count as "enrolled" in a cohort
const ENROLLED_STATUSES = ["paid", "welcome_package_sent"] as const;

/**
 * Get the student's private class enrollment if they have one
 * Returns null if student doesn't have an active private enrollment
 */
export async function getPrivateEnrollment(
	studentId: string,
): Promise<PrivateEnrollment | null> {
	const supabase = await createClient();

	// Fetch enrollments with private product format
	const { data: enrollments, error } = await supabase
		.from("enrollments")
		.select(
			`
			id,
			cohort_id,
			status,
			cohorts!inner (
				id,
				nickname,
				start_date,
				products!cohorts_product_id_products_id_fk (
					format
				),
				weekly_sessions (
					id,
					day_of_week,
					start_time,
					end_time,
					teacher_id,
					teachers!weekly_sessions_teacher_id_teachers_id_fk (
						id,
						first_name,
						last_name
					)
				)
			)
		`,
		)
		.eq("student_id", studentId)
		.in("status", ENROLLED_STATUSES);

	if (error || !enrollments || enrollments.length === 0) {
		return null;
	}

	// Find enrollment with private format
	const privateEnrollment = enrollments.find((enrollment) => {
		const cohort = enrollment.cohorts as any;
		return cohort?.products?.format === "private";
	});

	if (!privateEnrollment) {
		return null;
	}

	const cohort = privateEnrollment.cohorts as any;
	const weeklySessions = cohort?.weekly_sessions || [];

	// Get primary teacher from first weekly session
	const primarySession = weeklySessions[0];
	const primaryTeacher = primarySession?.teachers;

	// Transform weekly sessions
	const transformedSessions: WeeklySession[] = weeklySessions.map(
		(session: any) => ({
			id: session.id,
			dayOfWeek: session.day_of_week,
			startTime: session.start_time,
			endTime: session.end_time,
			teacherId: session.teacher_id,
			teacherName: session.teachers
				? `${session.teachers.first_name} ${session.teachers.last_name}`
				: null,
		}),
	);

	return {
		enrollmentId: privateEnrollment.id,
		cohortId: cohort.id,
		cohortNickname: cohort.nickname,
		cohortStartDate: cohort.start_date,
		productFormat: cohort.products?.format || "private",
		weeklySessions: transformedSessions,
		teacher: primaryTeacher
			? {
					id: primaryTeacher.id,
					name: `${primaryTeacher.first_name} ${primaryTeacher.last_name}`,
				}
			: null,
	};
}
