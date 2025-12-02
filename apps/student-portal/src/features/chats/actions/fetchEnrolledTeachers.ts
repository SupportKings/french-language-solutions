"use server";

import { getEnrolledTeachers } from "../queries/getEnrolledTeachers";

export async function fetchEnrolledTeachers() {
	try {
		const result = await getEnrolledTeachers();
		return { success: true, data: result };
	} catch (error: any) {
		console.error("Error fetching enrolled teachers:", error);
		return {
			success: false,
			error: error?.message || "Failed to fetch enrolled teachers",
		};
	}
}
