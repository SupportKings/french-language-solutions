import { createClient } from "@/lib/supabase/server";

import type { ClassSession } from "@/features/shared/types";

/**
 * Get all classes for the given cohort IDs with attendance records
 * Returns classes with teacher, cohort information, and attendance records formatted for the UI
 */
export async function getScheduleClasses(
	cohortIds: string[],
	studentId: string,
): Promise<ClassSession[]> {
	if (cohortIds.length === 0) {
		return [];
	}

	const supabase = await createClient();

	const { data: classes, error } = await supabase
		.from("classes")
		.select(
			`
			id,
			cohort_id,
			start_time,
			end_time,
			status,
			meeting_link,
			hangout_link,
			notes,
			teachers!classes_teacher_id_teachers_id_fk (
				id,
				first_name,
				last_name,
				user:user_id (
					image
				)
			),
			cohorts!classes_cohort_id_cohorts_id_fk (
				id,
				language_levels!cohorts_current_level_id_language_levels_id_fk (
					code,
				display_name
				),
				products!cohorts_product_id_products_id_fk (
					format,
					location
				)
			)
		`,
		)
		.in("cohort_id", cohortIds)
		.is("deleted_at", null)
		.order("start_time", { ascending: true });

	if (error) {
		console.error("Error fetching schedule classes:", error);
		return [];
	}

	// Fetch attendance records for this student
	const classIds = (classes || []).map((c) => c.id);
	const { data: attendanceRecords } = await supabase
		.from("attendance_records")
		.select(
			"id, class_id, status, homework_completed, homework_completed_at, notes",
		)
		.eq("student_id", studentId)
		.in("class_id", classIds);

	const attendanceMap = new Map(
		(attendanceRecords || []).map((record) => [record.class_id, record]),
	);

	return (classes || []).map((classItem) => {
		const teacher = classItem.teachers as any;
		const cohort = classItem.cohorts as any;
		const product = cohort?.products;
		const level = cohort?.language_levels;
		const attendance = attendanceMap.get(classItem.id);

		const teacherName = teacher
			? `${teacher.first_name} ${teacher.last_name}`
			: "TBD";

		return {
			id: classItem.id,
			cohortId: classItem.cohort_id,
			format: (product?.format || "group") as ClassSession["format"],
			level: level?.display_name || level?.code || "-",
			startTime: classItem.start_time,
			endTime: classItem.end_time,
			teacher: {
				id: teacher?.id || "",
				name: teacherName,
				avatar: teacher?.user?.image || undefined,
			},
			meetingLink: classItem.meeting_link || undefined,
			hangoutLink: classItem.hangout_link || undefined,
			status: classItem.status as ClassSession["status"],
			notes: classItem.notes || undefined,
			location:
			product?.location === "online"
				? "online"
				: product?.location === "in_person"
					? "in_person"
					: "in_person",
			attendanceRecord: attendance
				? {
						id: attendance.id,
						status: attendance.status,
						homeworkCompleted: attendance.homework_completed,
						homeworkCompletedAt: attendance.homework_completed_at,
						notes: attendance.notes,
					}
				: undefined,
		};
	});
}
