import {
	getTeacherIdFromSession,
	isAdmin,
	isTeacher,
	requireAuth,
} from "@/lib/rbac-middleware";
import { createClient } from "@/lib/supabase/server";

export interface UserForConversation {
	id: string;
	name: string | null;
	email: string;
	role: string;
}

/**
 * Get users that the current user can message
 * - Admins: can message anyone
 * - Teachers: can message their students + other teachers (NOT admins)
 * - Others: cannot create DMs
 */
export async function getAllUsers(): Promise<UserForConversation[]> {
	const session = await requireAuth();
	const supabase = await createClient();

	// Admin: can message anyone
	if (await isAdmin(session)) {
		const { data: users, error } = await supabase
			.from("user")
			.select("id, name, email, role")
			.neq("id", session.user.id)
			.order("name", { ascending: true, nullsFirst: false });

		if (error) {
			console.error("Supabase error fetching users:", error);
			throw new Error(`Failed to fetch users: ${error.message}`);
		}

		return users || [];
	}

	// Teacher: can message students in their cohorts + other teachers
	if (await isTeacher(session)) {
		const teacherId = await getTeacherIdFromSession(session);

		if (!teacherId) {
			return []; // Not a valid teacher
		}

		// Get teacher's cohort IDs
		const { data: weeklySessions } = await supabase
			.from("weekly_sessions")
			.select("cohort_id")
			.eq("teacher_id", teacherId);

		const cohortIds = weeklySessions?.map((ws) => ws.cohort_id) || [];

		if (cohortIds.length === 0) {
			// Teacher has no cohorts - can only message other teachers
			const { data: teachers, error } = await supabase
				.from("user")
				.select("id, name, email, role")
				.eq("role", "teacher")
				.neq("id", session.user.id)
				.order("name", { ascending: true, nullsFirst: false });

			if (error) {
				throw new Error(`Failed to fetch teachers: ${error.message}`);
			}

			return teachers || [];
		}

		// Get students in teacher's cohorts
		const { data: enrollments } = await supabase
			.from("enrollments")
			.select(
				`
        students!inner(
          user_id,
          full_name,
          email
        )
      `,
			)
			.in("cohort_id", cohortIds)
			.in("status", [
				"paid",
				"welcome_package_sent",
				"transitioning",
				"offboarding",
			]);

		const studentUserIds =
			enrollments?.map((e: any) => e.students?.user_id).filter(Boolean) || [];

		if (studentUserIds.length === 0) {
			// No students - can only message other teachers
			const { data: teachers, error } = await supabase
				.from("user")
				.select("id, name, email, role")
				.eq("role", "teacher")
				.neq("id", session.user.id)
				.order("name", { ascending: true, nullsFirst: false });

			if (error) {
				throw new Error(`Failed to fetch teachers: ${error.message}`);
			}

			return teachers || [];
		}

		// Get users: students in cohorts + all teachers (excluding current user and admins)
		const { data: users, error } = await supabase
			.from("user")
			.select("id, name, email, role")
			.or(`id.in.(${studentUserIds.join(",")}),role.eq.teacher`)
			.neq("id", session.user.id)
			.order("name", { ascending: true, nullsFirst: false });

		if (error) {
			throw new Error(`Failed to fetch accessible users: ${error.message}`);
		}

		// CRITICAL: Filter out admins and super_admins for teachers
		return (users || []).filter(
			(user) => user.role !== "admin" && user.role !== "super_admin"
		);
	}

	// Others (students in web app, though shouldn't exist): no access
	return [];
}
