"use server";

import { getConversationParticipants } from "../queries/getConversationParticipants";

export async function fetchConversationParticipants(conversationId: string) {
	try {
		const result = await getConversationParticipants({ conversationId });
		return { success: true, data: result };
	} catch (error: any) {
		console.error("Error fetching conversation participants:", error);
		return {
			success: false,
			error: error?.message || "Failed to fetch conversation participants",
		};
	}
}
