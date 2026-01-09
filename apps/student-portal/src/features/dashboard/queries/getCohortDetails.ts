import { createClient } from "@/lib/supabase/server";

// Enrollment statuses that count as "enrolled" in a cohort
const ENROLLED_STATUSES = [
	"paid",
	"welcome_package_sent",
	"transitioning",
	"offboarding",
] as const;

export interface CohortDetails {
	enrollmentId: string;
	enrollmentStatus: string;
	cohort: {
		id: string;
		startDate: string | null;
		googleDriveFolderId: string | null;
		currentLevel: {
			code: string;
			displayName: string;
			levelNumber: number | null;
			levelGroup: string | null;
		} | null;
		startingLevel: {
			code: string;
			displayName: string;
			levelNumber: number | null;
		} | null;
		product: {
			displayName: string;
			format: string;
			location: string;
		} | null;
	};
	stats: {
		totalClasses: number;
		completedClasses: number;
		attendedCount: number; // attended + attended_late
		totalAttendance: number; // All marked records (excluding unset)
		attendancePercentage: number;
		progressPercentage: number;
		hoursCompleted: number;
		totalHoursToNextLevel: number;
	};
	nextMajorLevel: {
		code: string;
		displayName: string;
		levelGroup: string;
	} | null;
	goalLevel: {
		code: string;
		displayName: string;
		levelNumber: number | null;
	} | null;
}

/**
 * Get enrolled cohort details for a student
 * Priority: non-transitioning enrollments over transitioning
 */
export async function getCohortDetails(
	studentId: string,
): Promise<CohortDetails | null> {
	const supabase = await createClient();

	// Fetch all active enrollments
	const { data: enrollments, error: enrollmentError } = await supabase
		.from("enrollments")
		.select(
			`
			id,
			cohort_id,
			status,
			cohorts!inner (
				id,
				start_date,
				google_drive_folder_id,
				current_level_id,
				starting_level_id,
				language_levels!cohorts_current_level_id_language_levels_id_fk (
					code,
					display_name,
					level_number,
					level_group
				),
				starting_levels:language_levels!cohorts_starting_level_id_language_levels_id_fk (
					code,
					display_name,
					level_number
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

	if (enrollmentError || !enrollments || enrollments.length === 0) {
		return null;
	}

	// Apply priority logic: prefer non-transitioning enrollments
	const primaryEnrollment = enrollments.find(
		(e) => e.status !== "transitioning",
	) || enrollments[0];

	const cohortId = primaryEnrollment.cohort_id;

	// Fetch student's goal level and all language levels, classes, and attendance data in parallel
	const [studentResult, allLevelsResult, classesResult, attendanceResult] =
		await Promise.all([
			// Get student with goal level
			supabase
				.from("students")
				.select(
					`
					id,
					goal_language_level_id,
					goal_language_level:language_levels!students_goal_language_level_id_fkey (
						code,
						display_name,
						level_number
					)
				`,
				)
				.eq("id", studentId)
				.single(),

			// Get all language levels with hours (for calculation)
			supabase
				.from("language_levels")
				.select("id, code, display_name, level_number, level_group, hours"),
		// Get all classes for the cohort
		supabase
			.from("classes")
			.select("id, status")
			.eq("cohort_id", cohortId)
			.is("deleted_at", null),

		// Get attendance records for the student in this cohort
		supabase
			.from("attendance_records")
			.select("id, status")
			.eq("student_id", studentId)
			.eq("cohort_id", cohortId),
	]);

	const student = studentResult.data;
	const allLevels = allLevelsResult.data || [];
	const classes = classesResult.data || [];
	const attendanceRecords = attendanceResult.data || [];

	// Calculate class stats
	const completedClasses = classes.filter(
		(c) => c.status === "completed",
	).length;
	const totalClasses = classes.length;

	// Calculate attendance stats
	// Exclude "unset" records from total
	const markedRecords = attendanceRecords.filter((a) => a.status !== "unset");
	const attendedCount = attendanceRecords.filter(
		(a) => a.status === "attended" || a.status === "attended_late",
	).length;
	const totalAttendance = markedRecords.length;
	const attendancePercentage =
		totalAttendance > 0 ? Math.round((attendedCount / totalAttendance) * 100) : 0;

	// Extract cohort data
	const cohortData = primaryEnrollment.cohorts as any;
	const currentLevel = cohortData?.language_levels;
	const startingLevel = cohortData?.starting_levels;
	const product = cohortData?.products;

	// Extract goal level from student
	const goalLevelData = student?.goal_language_level as any;

	// Calculate hours-based progress towards next major level
	let progressPercentage = 0;
	let hoursCompleted = 0;
	let totalHoursToNextLevel = 0;
	let nextMajorLevelData: { code: string; displayName: string; levelGroup: string } | null = null;

	// Define the order of major level groups
	const majorLevelOrder = ["a0", "a1", "a2", "b1", "b2", "c1", "c2"];

	if (currentLevel) {
		// Sort all levels using the same logic as the UI (by level_group, then code)
		const sortedLevels = [...allLevels].sort((a, b) => {
			// First sort by level_group (a0, a1, a2, b1, b2, c1, c2)
			if (a.level_group && b.level_group && a.level_group !== b.level_group) {
				return a.level_group.localeCompare(b.level_group);
			}

			// Then sort by code with natural sorting
			const getNumericPart = (code: string) => {
				const match = code.match(/\.(\d+)$/);
				return match ? Number.parseInt(match[1], 10) : 0;
			};

			const aNum = getNumericPart(a.code);
			const bNum = getNumericPart(b.code);

			if (aNum !== 0 || bNum !== 0) {
				return aNum - bNum;
			}

			return a.code.localeCompare(b.code);
		});

		// Find current level's group and determine the next major level group
		const currentLevelGroup = currentLevel.level_group;
		const currentGroupIndex = majorLevelOrder.indexOf(currentLevelGroup);
		const nextMajorGroup = currentGroupIndex !== -1 && currentGroupIndex < majorLevelOrder.length - 1
			? majorLevelOrder[currentGroupIndex + 1]
			: null;

		if (nextMajorGroup) {
			// Find the first level of the next major group (this is the target)
			const nextMajorLevel = sortedLevels.find((l) => l.level_group === nextMajorGroup);

			if (nextMajorLevel) {
				nextMajorLevelData = {
					code: nextMajorLevel.code,
					displayName: nextMajorLevel.display_name,
					levelGroup: nextMajorLevel.level_group,
				};

				// Find the first level of current major group (start of current major level)
				const currentMajorGroupStart = sortedLevels.find((l) => l.level_group === currentLevelGroup);

				if (currentMajorGroupStart) {
					const currentMajorStartIndex = sortedLevels.findIndex(
						(l) => l.code === currentMajorGroupStart.code,
					);
					const currentIndex = sortedLevels.findIndex(
						(l) => l.code === currentLevel.code,
					);
					const nextMajorIndex = sortedLevels.findIndex(
						(l) => l.code === nextMajorLevel.code,
					);

					if (currentMajorStartIndex !== -1 && currentIndex !== -1 && nextMajorIndex !== -1) {
						// Hours completed = from start of current major level to current level (inclusive of current)
						hoursCompleted = sortedLevels
							.slice(currentMajorStartIndex, currentIndex + 1)
							.reduce((sum, level) => sum + (level.hours || 0), 0);

						// Total hours = from start of current major level to end of current major level (before next major)
						totalHoursToNextLevel = sortedLevels
							.slice(currentMajorStartIndex, nextMajorIndex)
							.reduce((sum, level) => sum + (level.hours || 0), 0);

						// Calculate percentage
						progressPercentage =
							totalHoursToNextLevel > 0
								? Math.round((hoursCompleted / totalHoursToNextLevel) * 100)
								: 0;

						// Cap at 100%
						progressPercentage = Math.min(progressPercentage, 100);
					}
				}
			}
		}
	}

	return {
		enrollmentId: primaryEnrollment.id,
		enrollmentStatus: primaryEnrollment.status,
		cohort: {
			id: cohortData?.id,
			startDate: cohortData?.start_date || null,
			googleDriveFolderId: cohortData?.google_drive_folder_id || null,
			currentLevel: currentLevel
				? {
						code: currentLevel.code,
						displayName: currentLevel.display_name,
						levelNumber: currentLevel.level_number,
						levelGroup: currentLevel.level_group,
					}
				: null,
			startingLevel: startingLevel
				? {
						code: startingLevel.code,
						displayName: startingLevel.display_name,
						levelNumber: startingLevel.level_number,
					}
				: null,
			product: product
				? {
						displayName: product.display_name,
						format: product.format,
						location: product.location,
					}
				: null,
		},
		stats: {
			totalClasses,
			completedClasses,
			attendedCount,
			totalAttendance,
			attendancePercentage,
			progressPercentage,
			hoursCompleted,
			totalHoursToNextLevel,
		},
		nextMajorLevel: nextMajorLevelData,
		goalLevel: goalLevelData
			? {
					code: goalLevelData.code,
					displayName: goalLevelData.display_name,
					levelNumber: goalLevelData.level_number,
				}
			: null,
	};
}
