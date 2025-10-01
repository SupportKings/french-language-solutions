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
 */
export async function hasPermission(
	resource: string,
	action: string
): Promise<boolean> {
	const session = await getUserSession();
	if (!session) return false;

	// Admin has access to everything
	if (session.user.role === "admin") return true;

	// Check permission using Better Auth's access control
	// Note: You would need to implement the actual permission check here
	// based on the session's role statements
	return false;
}

/**
 * Get teacher ID from user session
 * Returns the teacher record ID if the user is linked to a teacher
 */
export async function getTeacherIdFromSession(): Promise<string | null> {
	const session = await getUserSession();
	if (!session) return null;

	// Query the teachers table to find the teacher with this user_id
	// You'll need to implement this based on your database setup
	// For now, returning null as a placeholder
	return null;
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
