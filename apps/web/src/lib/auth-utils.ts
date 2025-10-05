"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Get current user session and permissions
 * Returns user session with role and permission statements
 */
export async function getUserSession() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return null;
	}

	return session;
}

/**
 * Check if user is an admin
 * Admins have the "admin" role
 */
export async function isAdmin() {
	const session = await getUserSession();
	if (!session) return false;

	return session.user.role === "admin";
}

/**
 * Check if user is a teacher (and not an admin)
 * Teachers have the "teacher" role
 */
export async function isTeacher() {
	const session = await getUserSession();
	if (!session) return false;

	return session.user.role === "teacher";
}

/**
 * Check if user has permission to access something
 * Uses Better Auth's permission system
 */
export async function hasPermission(
	resource: string,
	actions: string[]
): Promise<boolean> {
	const session = await getUserSession();
	if (!session) return false;

	// Admin has access to everything
	if (session.user.role === "admin") return true;

	// Check permission using Better Auth's access control
	try {
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
 * Get teacher ID from user session
 * Returns the teacher record ID if the user is linked to a teacher
 */
export async function getTeacherIdFromSession(): Promise<string | null> {
	const session = await getUserSession();
	if (!session) return null;

	// Dynamically import to avoid circular dependencies
	const { createClient } = await import("@/lib/supabase/server");
	const supabase = await createClient();

	const { data: teacher } = await supabase
		.from("teachers")
		.select("id")
		.eq("user_id", session.user.id)
		.maybeSingle();

	return teacher?.id || null;
}

/**
 * Check if user can access all students/cohorts or only assigned ones
 */
export async function canAccessAllData(): Promise<boolean> {
	const session = await getUserSession();
	if (!session) return false;

	// Admins can access all data
	return session.user.role === "admin";
}

/**
 * Get user permissions object
 */
export async function getUserPermissions() {
	const session = await getUserSession();
	if (!session) return null;

	// Return the role statements from Better Auth
	// This will be used in client-side permission checks
	return {
		role: session.user.role,
		// Add permission statements when available
	};
}
