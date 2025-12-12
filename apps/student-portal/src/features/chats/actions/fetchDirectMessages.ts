"use server";

import { getDirectMessages } from "../queries/getDirectMessages";

export async function fetchDirectMessages(conversationId: string, page = 1) {
	try {
		const result = await getDirectMessages({ conversationId, page, limit: 50 });
		return { success: true, data: result };
	} catch (error: any) {
		console.error("Error fetching direct messages:", error);
		return {
			success: false,
			error: error?.message || "Failed to fetch messages",
		};
	}
}
