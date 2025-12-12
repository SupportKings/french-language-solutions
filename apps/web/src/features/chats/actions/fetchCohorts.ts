"use server";

import { getAllCohorts } from "../queries/getAllCohorts";

export async function fetchCohorts(page = 1, searchQuery?: string) {
	try {
		const result = await getAllCohorts({ page, limit: 20, searchQuery });
		return { success: true, data: result };
	} catch (error: any) {
		console.error("Error fetching cohorts:", error);
		return {
			success: false,
			error: error?.message || "Failed to fetch cohorts",
		};
	}
}
