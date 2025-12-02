"use server";

import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function getEnrolledTeachers() {
	const user = await requireAuth();
	const supabase = await createClient();

	// Get student record
	const { data: student } = await supabase
		.from("students")
		.select("id")
		.eq("user_id", user.id)
		.single();

	if (!student) {
		throw new Error("Student not found");
	}

	// Get cohort IDs from student's enrollments
	const { data: enrollments, error: enrollmentsError } = await supabase
		.from("enrollments")
		.select("cohort_id")
		.eq("student_id", student.id)
		.in("status", [
			"paid",
			"welcome_package_sent",
			"transitioning",
			"offboarding",
		]);

	if (enrollmentsError) {
		console.error("Error fetching enrollments:", enrollmentsError);
		return [];
	}

	const cohortIds = enrollments?.map((e) => e.cohort_id).filter(Boolean) || [];

	if (cohortIds.length === 0) {
		return [];
	}

	// Get teachers from weekly_sessions for these cohorts
	const { data: sessionsData, error: sessionsError } = await supabase
		.from("weekly_sessions")
		.select(
			`
      teachers!inner(
        id,
        user_id,
        first_name,
        last_name,
        email
      )
    `,
		)
		.in("cohort_id", cohortIds);

	if (sessionsError) {
		console.error("Error fetching teachers:", sessionsError);
		return [];
	}

	// Deduplicate teachers and get user info
	const teachersMap = new Map<string, any>();
	for (const session of sessionsData || []) {
		const teacher = (session as any).teachers;
		if (teacher?.user_id && !teachersMap.has(teacher.user_id)) {
			teachersMap.set(teacher.user_id, {
				id: teacher.user_id,
				name:
					`${teacher.first_name || ""} ${teacher.last_name || ""}`.trim() ||
					teacher.email ||
					null,
				email: teacher.email || "",
				role: "teacher",
			});
		}
	}

	return Array.from(teachersMap.values());
}
