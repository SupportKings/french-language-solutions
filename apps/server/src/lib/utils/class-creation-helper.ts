import { supabase } from "../supabase";

export interface ClassToCreate {
	cohort_id: string;
	teacher_id: string | null;
	start_time: string; // ISO datetime
	end_time: string; // ISO datetime
	google_calendar_event_id: string | null;
	meeting_link: string | null;
	status: "scheduled";
}

export interface CreateClassesResult {
	success: boolean;
	message: string;
	classesCreated: number;
	attendanceRecordsCreated: number;
}

/**
 * Get enrolled students for given cohorts
 * Returns map of cohort_id -> array of student_ids
 * Only includes students with status: paid or welcome_package_sent
 *
 * @param cohortIds - Array of cohort IDs to get enrolled students for
 * @returns Map of cohort_id to array of student_ids
 */
export async function getEnrolledStudents(
	cohortIds: string[],
): Promise<Map<string, string[]>> {
	const { data: enrollments, error } = await supabase
		.from("enrollments")
		.select("cohort_id, student_id, status")
		.in("cohort_id", cohortIds)
		.in("status", ["paid", "welcome_package_sent"]);

	if (error) {
		console.error("Error fetching enrollments:", error);
		return new Map();
	}

	const cohortStudentMap = new Map<string, string[]>();

	for (const enrollment of enrollments || []) {
		const students = cohortStudentMap.get(enrollment.cohort_id) || [];
		students.push(enrollment.student_id);
		cohortStudentMap.set(enrollment.cohort_id, students);
	}

	return cohortStudentMap;
}

/**
 * Create class records and associated attendance records
 * This is the shared logic used by both createClassesForTomorrow and createClassesFromCalendarEvents
 *
 * @param classesToCreate - Array of class objects to create
 * @returns Result object with success status and counts
 */
export async function createClassesWithAttendance(
	classesToCreate: ClassToCreate[],
): Promise<CreateClassesResult> {
	if (classesToCreate.length === 0) {
		return {
			success: true,
			message: "No classes to create",
			classesCreated: 0,
			attendanceRecordsCreated: 0,
		};
	}

	// Bulk insert classes
	const { data: createdClasses, error: classError } = await supabase
		.from("classes")
		.insert(classesToCreate)
		.select();

	if (classError) {
		console.error("Error creating classes:", classError);
		return {
			success: false,
			message: `Failed to create classes: ${classError.message}`,
			classesCreated: 0,
			attendanceRecordsCreated: 0,
		};
	}

	// Get enrolled students for all cohorts
	const cohortIds = [...new Set(classesToCreate.map((c) => c.cohort_id))];
	const cohortStudentMap = await getEnrolledStudents(cohortIds);

	// Prepare attendance records
	const attendanceRecords: Array<{
		class_id: string;
		cohort_id: string;
		student_id: string;
		status: "unset";
		homework_completed: boolean;
	}> = [];

	for (const classRecord of createdClasses || []) {
		const students = cohortStudentMap.get(classRecord.cohort_id) || [];
		for (const studentId of students) {
			attendanceRecords.push({
				class_id: classRecord.id,
				cohort_id: classRecord.cohort_id,
				student_id: studentId,
				status: "unset",
				homework_completed: false,
			});
		}
	}

	// Bulk insert attendance records
	if (attendanceRecords.length > 0) {
		const { error: attendanceError } = await supabase
			.from("attendance_records")
			.insert(attendanceRecords);

		if (attendanceError) {
			console.error("Error creating attendance records:", attendanceError);
			return {
				success: false,
				message: `Classes created but failed to create attendance records: ${attendanceError.message}`,
				classesCreated: createdClasses?.length || 0,
				attendanceRecordsCreated: 0,
			};
		}
	}

	return {
		success: true,
		message: `Successfully created ${createdClasses?.length || 0} classes with ${attendanceRecords.length} attendance records`,
		classesCreated: createdClasses?.length || 0,
		attendanceRecordsCreated: attendanceRecords.length,
	};
}
