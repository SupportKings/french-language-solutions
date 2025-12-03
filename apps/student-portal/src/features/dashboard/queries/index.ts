import { createClient } from "@/lib/supabase/server";

import type { StudentStats } from "@/features/shared/types";

import { endOfWeek, startOfWeek } from "date-fns";

export { getCohortDetails } from "./getCohortDetails";
export type { CohortDetails } from "./getCohortDetails";

// Enrollment statuses that count as "enrolled" in a cohort
const ENROLLED_STATUSES = [
	"paid",
	"welcome_package_sent",
	"transitioning",
	"offboarding",
] as const;

export interface StudentEnrollment {
	id: string;
	cohortId: string;
	status: string;
	cohort: {
		id: string;
		currentLevelId: string | null;
		currentLevel: {
			code: string;
			displayName: string;
		} | null;
		product: {
			displayName: string;
			format: string;
			location: string;
		} | null;
	};
}

/**
 * Get all active enrollments for a student
 * Only returns enrollments with status: paid, welcome_package_sent, transitioning, offboarding
 */
export async function getStudentEnrollments(
	studentId: string,
): Promise<StudentEnrollment[]> {
	const supabase = await createClient();

	const { data: enrollments, error } = await supabase
		.from("enrollments")
		.select(
			`
			id,
			cohort_id,
			status,
			cohorts!inner (
				id,
				current_level_id,
				language_levels!cohorts_current_level_id_language_levels_id_fk (
					code,
					display_name
				),
				products!cohorts_product_id_products_id_fk (
					display_name,
					format,
					location
				)
			)
		`,
		)
		.eq("student_id", studentId)
		.in("status", ENROLLED_STATUSES);

	if (error) {
		console.error("Error fetching student enrollments:", error);
		return [];
	}

	return (enrollments || []).map((enrollment) => ({
		id: enrollment.id,
		cohortId: enrollment.cohort_id!,
		status: enrollment.status,
		cohort: {
			id: (enrollment.cohorts as any)?.id,
			currentLevelId: (enrollment.cohorts as any)?.current_level_id,
			currentLevel: (enrollment.cohorts as any)?.language_levels
				? {
						code: (enrollment.cohorts as any).language_levels.code,
						displayName: (enrollment.cohorts as any).language_levels
							.display_name,
					}
				: null,
			product: (enrollment.cohorts as any)?.products
				? {
						displayName: (enrollment.cohorts as any).products.display_name,
						format: (enrollment.cohorts as any).products.format,
						location: (enrollment.cohorts as any).products.location,
					}
				: null,
		},
	}));
}

/**
 * Calculate student stats based on their enrollments
 */
export async function getStudentStats(
	studentId: string,
	cohortIds: string[],
): Promise<StudentStats> {
	const supabase = await createClient();

	if (cohortIds.length === 0) {
		return {
			attendanceRate: 0,
			completionRate: 0,
			currentLevel: "-",
			totalClasses: 0,
			completedClasses: 0,
			upcomingClasses: 0,
		};
	}

	const now = new Date();
	const weekStart = startOfWeek(now, { weekStartsOn: 1 });
	const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

	// Fetch all required data in parallel
	const [classesResult, attendanceResult, enrollmentsResult] =
		await Promise.all([
			// Get all classes for the student's cohorts
			supabase
				.from("classes")
				.select("id, status, start_time, cohort_id")
				.in("cohort_id", cohortIds)
				.is("deleted_at", null),

			// Get attendance records for the student
			supabase
				.from("attendance_records")
				.select("id, status, class_id, cohort_id")
				.eq("student_id", studentId)
				.in("cohort_id", cohortIds),

			// Get the current level from enrollments
			supabase
				.from("enrollments")
				.select(
					`
				cohorts!inner (
					language_levels!cohorts_current_level_id_language_levels_id_fk (
						code
					)
				)
			`,
				)
				.eq("student_id", studentId)
				.in("status", ENROLLED_STATUSES)
				.limit(1)
				.single(),
		]);

	const classes = classesResult.data || [];
	const attendanceRecords = attendanceResult.data || [];

	// Calculate stats
	const completedClasses = classes.filter(
		(c) => c.status === "completed",
	).length;
	const totalClasses = classes.length;

	// Classes this week (upcoming or scheduled)
	const upcomingClasses = classes.filter((c) => {
		const classDate = new Date(c.start_time);
		return (
			classDate >= weekStart &&
			classDate <= weekEnd &&
			(c.status === "scheduled" || c.status === "in_progress")
		);
	}).length;

	// Calculate attendance rate
	// Count attendance records where student was present
	const presentCount = attendanceRecords.filter(
		(a) => a.status === "present",
	).length;
	const attendanceRate =
		completedClasses > 0
			? Math.round((presentCount / completedClasses) * 100)
			: 0;

	// Get current level
	const currentLevel =
		(enrollmentsResult.data?.cohorts as any)?.language_levels?.code || "-";

	return {
		attendanceRate,
		completionRate:
			totalClasses > 0
				? Math.round((completedClasses / totalClasses) * 100)
				: 0,
		currentLevel,
		totalClasses,
		completedClasses,
		upcomingClasses,
	};
}
