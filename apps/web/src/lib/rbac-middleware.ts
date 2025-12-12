"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * RBAC Middleware for API Routes
 * Provides helper functions to check permissions and filter data
 */

// ============================================
// 1. AUTHENTICATION & SESSION
// ============================================

/**
 * Get current authenticated user session
 * Throws 401 if not authenticated
 */
export async function requireAuth() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		throw new Error("UNAUTHORIZED");
	}

	return session;
}

// ============================================
// 2. ROLE CHECKS
// ============================================

/**
 * Check if current user is an admin
 * Admins have unrestricted access to everything
 */
export async function isAdmin(
	session?: Awaited<ReturnType<typeof requireAuth>>,
) {
	const userSession = session || (await requireAuth());
	return userSession.user.role === "admin";
}

/**
 * Check if current user is a teacher (and NOT an admin)
 */
export async function isTeacher(
	session?: Awaited<ReturnType<typeof requireAuth>>,
) {
	const userSession = session || (await requireAuth());
	return userSession.user.role === "teacher";
}

/**
 * Require admin role - throws error if not admin
 */
export async function requireAdmin() {
	const session = await requireAuth();
	if (!(await isAdmin(session))) {
		throw new Error("FORBIDDEN");
	}
	return session;
}

// ============================================
// 3. PERMISSION CHECKS (Better Auth)
// ============================================

/**
 * Check if user has specific permission using Better Auth
 */
export async function hasPermission(
	resource: string,
	actions: string[],
): Promise<boolean> {
	try {
		const session = await requireAuth();

		const result = await auth.api.userHasPermission({
			body: {
				userId: session.user.id,
				permissions: {
					[resource]: actions,
				},
			},
		});
		return result.success || false;
	} catch (error) {
		console.error("Permission check failed:", error);
		return false;
	}
}

/**
 * Require specific permission - throws error if not authorized
 */
export async function requirePermission(resource: string, actions: string[]) {
	const has = await hasPermission(resource, actions);
	if (!has) {
		throw new Error("FORBIDDEN");
	}
}

// ============================================
// 4. TEACHER DATA ACCESS HELPERS
// ============================================

/**
 * Get teacher record ID from current user session
 * Returns null if user is not linked to a teacher
 */
export async function getTeacherIdFromSession(
	session?: Awaited<ReturnType<typeof requireAuth>>,
): Promise<string | null> {
	const userSession = session || (await requireAuth());
	const supabase = await createClient();

	const { data: teacher } = await supabase
		.from("teachers")
		.select("id")
		.eq("user_id", userSession.user.id)
		.maybeSingle();

	return teacher?.id || null;
}

/**
 * Get cohort IDs that a teacher is assigned to
 * Returns empty array if teacher has no assignments
 */
export async function getTeacherCohortIds(
	teacherId: string,
): Promise<string[]> {
	const supabase = await createClient();

	const { data: weeklySessions } = await supabase
		.from("weekly_sessions")
		.select("cohort_id")
		.eq("teacher_id", teacherId);

	return weeklySessions?.map((ws) => ws.cohort_id) || [];
}

/**
 * Get cohort IDs for current user (if they're a teacher)
 */
export async function getCurrentUserCohortIds(
	session?: Awaited<ReturnType<typeof requireAuth>>,
): Promise<string[]> {
	const teacherId = await getTeacherIdFromSession(session);
	if (!teacherId) return [];

	return await getTeacherCohortIds(teacherId);
}

/**
 * Check if teacher has access to specific cohort
 */
export async function canAccessCohort(cohortId: string): Promise<boolean> {
	const session = await requireAuth();

	// Admins can access all cohorts
	if (await isAdmin(session)) return true;

	// Teachers can only access their assigned cohorts
	const teacherCohortIds = await getCurrentUserCohortIds(session);
	return teacherCohortIds.includes(cohortId);
}

/**
 * Check if teacher has access to specific student
 * Students are accessible if enrolled in any of teacher's cohorts
 */
export async function canAccessStudent(studentId: string): Promise<boolean> {
	const session = await requireAuth();

	// Admins can access all students
	if (await isAdmin(session)) return true;

	// Teachers can access students in their cohorts
	const supabase = await createClient();
	const teacherCohortIds = await getCurrentUserCohortIds(session);

	if (teacherCohortIds.length === 0) return false;

	// Check if student is enrolled in any of teacher's cohorts
	// Use array to handle students with multiple enrollments
	const { data: enrollments } = await supabase
		.from("enrollments")
		.select("id")
		.eq("student_id", studentId)
		.in("cohort_id", teacherCohortIds);

	return (enrollments?.length || 0) > 0;
}

// ============================================
// 5. DATA FILTERING HELPERS
// ============================================

/**
 * Apply RBAC filtering to a Supabase query for students
 * Filters students based on user's role and permissions
 */
export async function applyStudentFilter<T>(
	query: any,
	session?: Awaited<ReturnType<typeof requireAuth>>,
) {
	const userSession = session || (await requireAuth());

	// Admins see all students - no filtering needed
	if (await isAdmin(userSession)) {
		return query;
	}

	// Teachers only see students in their assigned cohorts
	const teacherCohortIds = await getCurrentUserCohortIds(userSession);

	if (teacherCohortIds.length === 0) {
		// Teacher has no cohorts - return query that matches nothing
		return query.eq("id", "00000000-0000-0000-0000-000000000000");
	}

	// Filter students by enrollment in teacher's cohorts
	// Note: This requires a join or filtering in JavaScript after fetch
	return query;
}

/**
 * Apply RBAC filtering to a Supabase query for cohorts
 * Filters cohorts based on user's role and permissions
 */
export async function applyCohortFilter(
	query: any,
	session?: Awaited<ReturnType<typeof requireAuth>>,
) {
	const userSession = session || (await requireAuth());

	// Admins see all cohorts - no filtering needed
	if (await isAdmin(userSession)) {
		return query;
	}

	// Teachers only see their assigned cohorts
	const teacherCohortIds = await getCurrentUserCohortIds(userSession);

	if (teacherCohortIds.length === 0) {
		// Teacher has no cohorts - return query that matches nothing
		return query.eq("id", "00000000-0000-0000-0000-000000000000");
	}

	// Filter cohorts by IDs
	return query.in("id", teacherCohortIds);
}

/**
 * Filter array of students based on teacher's cohort access
 * Used for in-memory filtering when database filtering isn't feasible
 * Teachers see all students in their assigned cohorts regardless of enrollment status
 */
export async function filterStudentsByAccess(
	students: any[],
	session?: Awaited<ReturnType<typeof requireAuth>>,
): Promise<any[]> {
	const userSession = session || (await requireAuth());

	// Admins see all students
	if (await isAdmin(userSession)) {
		return students;
	}

	// Teachers see students in their cohorts (any enrollment status)
	const teacherCohortIds = await getCurrentUserCohortIds(userSession);

	if (teacherCohortIds.length === 0) {
		return [];
	}

	// Filter students who have enrollments in teacher's cohorts
	return students.filter((student) => {
		const enrollments = student.enrollments || [];
		return enrollments.some((enrollment: any) =>
			teacherCohortIds.includes(enrollment.cohort_id),
		);
	});
}
