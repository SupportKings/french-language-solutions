"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export async function getTeacherUser(userId: string | null) {
	if (!userId) return null;

	try {
		// Get the current session to ensure authentication
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return null;
		}

		// Search for the user - we'll search by email first, then filter by ID
		// Note: Better Auth's searchField doesn't support "id" directly
		const searchResult = await auth.api.listUsers({
			query: {
				// We'll get all users and filter manually since searchField doesn't support ID
				limit: 100,
			},
			headers: await headers(),
		});

		const user = searchResult.users?.find((u) => u.id === userId);

		if (user) {
			return {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
				createdAt: user.createdAt,
			};
		}

		return null;
	} catch (error) {
		console.error("Error fetching teacher user:", error);
		return null;
	}
}
