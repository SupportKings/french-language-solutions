import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

import type { ConversationParticipant } from "../types";

interface GetConversationParticipantsParams {
	conversationId: string;
}

interface GetConversationParticipantsResult {
	participants: ConversationParticipant[];
}

/**
 * Get all participants for a conversation
 * Used to display in the members sidebar for direct chats
 */
export async function getConversationParticipants({
	conversationId,
}: GetConversationParticipantsParams): Promise<GetConversationParticipantsResult> {
	const user = await requireAuth();
	const supabase = await createClient();

	// Verify user is a participant in this conversation
	const { data: participant } = await supabase
		.from("conversation_participants")
		.select("id")
		.eq("conversation_id", conversationId)
		.eq("user_id", user.id)
		.maybeSingle();

	if (!participant) {
		throw new Error("FORBIDDEN: You don't have access to this conversation");
	}

	// Fetch all participants with user information
	const { data: participantsData, error } = await supabase
		.from("conversation_participants")
		.select(
			`
			user_id,
			joined_at,
			user:user!conversation_participants_user_id_fkey(
				id,
				name,
				email,
				role
			)
		`,
		)
		.eq("conversation_id", conversationId)
		.order("joined_at", { ascending: true });

	if (error) {
		throw new Error(`Failed to fetch participants: ${error.message}`);
	}

	const participants: ConversationParticipant[] =
		participantsData?.map((p: any) => ({
			userId: p.user_id,
			name: p.user?.name || null,
			email: p.user?.email || "",
			role: p.user?.role || "student",
			joinedAt: p.joined_at,
		})) || [];

	return {
		participants,
	};
}
