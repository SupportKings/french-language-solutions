"use server";

import { getMessages } from "../queries/getMessages";

export async function fetchMessages(cohortId: string, page = 1, limit = 10) {
	try {
		const result = await getMessages({ cohortId, page, limit });
		return { success: true, data: result };
	} catch (error: any) {
		console.error("Error fetching messages:", error);
		return {
			success: false,
			error: error?.message || "Failed to fetch messages",
		};
	}
}
