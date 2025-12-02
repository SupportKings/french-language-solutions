"use server";

import { getCohortMembers } from "../queries/getCohortMembers";

export async function fetchCohortMembers(cohortId: string) {
	try {
		const result = await getCohortMembers({ cohortId });
		return { success: true, data: result };
	} catch (error: any) {
		console.error("Error fetching cohort members:", error);
		return {
			success: false,
			error: error?.message || "Failed to fetch cohort members",
		};
	}
}
