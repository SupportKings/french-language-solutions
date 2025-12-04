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

	// Fetch teacher user images separately
	const teacherUserIds =
		teachersData?.map((item: any) => item.teachers?.user_id).filter(Boolean) ||
		[];

	const teacherUserImages: Record<string, string | null> = {};
	if (teacherUserIds.length > 0) {
		const { data: usersData } = await supabase
			.from("user")
			.select("id, image")
			.in("id", teacherUserIds);

		usersData?.forEach((u: any) => {
			teacherUserImages[u.id] = u.image;
		});
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
				userId: teacher.user_id || "",
				name: fullName || teacher.email || null,
				email: teacher.email || "",
				image: teacherUserImages[teacher.user_id] || null,
				role: "teacher" as const,
			});
		}
	});
	const teachers = Array.from(teachersMap.values()).sort((a, b) =>
		(a.name || "").localeCompare(b.name || ""),
	);

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

	// Fetch user images separately
	const studentUserIds =
		studentsData?.map((item: any) => item.students?.user_id).filter(Boolean) ||
		[];

	const studentUserImages: Record<string, string | null> = {};
	if (studentUserIds.length > 0) {
		const { data: usersData } = await supabase
			.from("user")
			.select("id, image")
			.in("id", studentUserIds);

		usersData?.forEach((u: any) => {
			studentUserImages[u.id] = u.image;
		});
	}

	// Transform students data and remove duplicates
	const studentsMap = new Map<string, CohortMember>();
	studentsData?.forEach((item: any) => {
		const student = item.students;
		if (!studentsMap.has(student.id)) {
			studentsMap.set(student.id, {
				id: student.id,
				userId: student.user_id || "",
				name: student.full_name || student.email || null,
				email: student.email || "",
				image: studentUserImages[student.user_id] || null,
				role: "student" as const,
				enrollmentStatus: item.status,
			});
		}
	});
	const students = Array.from(studentsMap.values()).sort((a, b) =>
		(a.name || "").localeCompare(b.name || ""),
	);

	return {
		teachers,
		students,
		totalCount: teachers.length + students.length,
	};
}
