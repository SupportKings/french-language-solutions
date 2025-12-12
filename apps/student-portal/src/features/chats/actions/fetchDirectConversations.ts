"use server";

import { getDirectConversations } from "../queries/getDirectConversations";

export async function fetchDirectConversations() {
	try {
		const result = await getDirectConversations();
		return { success: true, data: result };
	} catch (error: any) {
		console.error("Error fetching direct conversations:", error);
		return {
			success: false,
			error: error?.message || "Failed to fetch conversations",
		};
	}
}
