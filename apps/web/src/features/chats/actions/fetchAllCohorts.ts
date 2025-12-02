"use server";

import { getAllCohortsForSelection } from "../queries/getAllCohortsForSelection";

export async function fetchAllCohorts() {
	try {
		const cohorts = await getAllCohortsForSelection();
		return { success: true, data: cohorts };
	} catch (error: any) {
		console.error("Error fetching all cohorts:", error);
		return {
			success: false,
			error: error?.message || "Failed to fetch cohorts",
		};
	}
}
