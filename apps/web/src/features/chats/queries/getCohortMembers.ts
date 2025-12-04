import { createClient } from "@/lib/supabase/server";

import type { CohortMember, CohortMembers } from "../types";

interface GetCohortMembersParams {
	cohortId: string;
}

export async function getCohortMembers({
	cohortId,
}: GetCohortMembersParams): Promise<CohortMembers> {
	const supabase = await createClient();

	// Fetch teachers via weekly_sessions
	const { data: teachersData, error: teachersError } = await supabase
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
		.eq("cohort_id", cohortId);

	if (teachersError) {
		console.error("Error fetching teachers:", teachersError);
	}

	// Transform teachers data and remove duplicates
	const teachersMap = new Map<string, CohortMember>();
	teachersData?.forEach((item: any) => {
		const teacher = item.teachers;
		const fullName =
			`${teacher.first_name || ""} ${teacher.last_name || ""}`.trim();
		if (!teachersMap.has(teacher.id)) {
			teachersMap.set(teacher.id, {
				id: teacher.id,
				userId: teacher.user_id,
				name: fullName || teacher.email || null,
				email: teacher.email || "",
				role: "teacher" as const,
			});
		}
	});
	const teachers = Array.from(teachersMap.values());

	// Fetch students via enrollments (active only)
	const { data: studentsData, error: studentsError } = await supabase
		.from("enrollments")
		.select(
			`
      status,
      students!inner(
        id,
        user_id,
        full_name,
        email
      )
    `,
		)
		.eq("cohort_id", cohortId)
		.in("status", [
			"paid",
			"welcome_package_sent",
			"transitioning",
			"offboarding",
		]);

	if (studentsError) {
		console.error("Error fetching students:", studentsError);
	}

	// Transform students data and remove duplicates
	const studentsMap = new Map<string, CohortMember>();
	studentsData?.forEach((item: any) => {
		const student = item.students;
		if (!studentsMap.has(student.id)) {
			studentsMap.set(student.id, {
				id: student.id,
				userId: student.user_id,
				name: student.full_name || student.email || null,
				email: student.email || "",
				role: "student" as const,
				enrollmentStatus: item.status,
			});
		}
	});

	// Fetch user images for all members
	const allUserIds = [
		...teachers.map((t) => t.userId),
		...Array.from(studentsMap.values()).map((s) => s.userId),
	].filter(Boolean);

	if (allUserIds.length > 0) {
		const { data: usersData } = await supabase
			.from("user")
			.select("id, image")
			.in("id", allUserIds);

		const userImageMap = new Map(usersData?.map((u) => [u.id, u.image]) || []);

		// Add images to teachers
		teachers.forEach((t) => {
			t.image = userImageMap.get(t.userId) || null;
		});

		// Add images to students
		studentsMap.forEach((s) => {
			s.image = userImageMap.get(s.userId) || null;
		});
	}

	// Sort after adding images
	teachers.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
	const students = Array.from(studentsMap.values()).sort((a, b) =>
		(a.name || "").localeCompare(b.name || ""),
	);

	return {
		teachers,
		students,
		totalCount: teachers.length + students.length,
	};
}
