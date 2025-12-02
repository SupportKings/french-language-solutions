"use server";

import { actionClient } from "@/lib/safe-action";
import { requireAdmin } from "@/lib/rbac-middleware";
import { createClient } from "@/lib/supabase/server";

import { z } from "zod";

const schema = z.object({
	participantIds: z
		.array(z.string())
		.min(1, "At least one participant is required"),
});

export const createConversationAsAdmin = actionClient
	.inputSchema(schema)
	.action(async ({ parsedInput }) => {
		// Verify user is authenticated and is an admin
		const session = await requireAdmin();
		const supabase = await createClient();

		// Add current user to participants if not already included
		const allParticipantIds = Array.from(
			new Set([...parsedInput.participantIds, session.user.id]),
		);

		// Check if conversation already exists with these exact participants
		const { data: existingConversations } = await supabase
			.from("conversations")
			.select(
				`
				id,
				conversation_participants!inner(user_id)
			`,
			)
			.eq("deleted_at", null);

		// Find a conversation with exact same participants
		const existingConversation = existingConversations?.find((conv: any) => {
			const convParticipantIds = (conv.conversation_participants as any[]).map(
				(p) => p.user_id,
			);
			return (
				convParticipantIds.length === allParticipantIds.length &&
				allParticipantIds.every((id) => convParticipantIds.includes(id))
			);
		});

		if (existingConversation) {
			return {
				conversationId: existingConversation.id,
				isNew: false,
			};
		}

		// Create new conversation
		const { data: conversation, error: conversationError } = await supabase
			.from("conversations")
			.insert({})
			.select()
			.single();

		if (conversationError || !conversation) {
			throw new Error("Failed to create conversation");
		}

		// Add participants
		const participantsToInsert = allParticipantIds.map((userId) => ({
			conversation_id: conversation.id,
			user_id: userId,
		}));

		const { error: participantsError } = await supabase
			.from("conversation_participants")
			.insert(participantsToInsert);

		if (participantsError) {
			// Rollback: delete the conversation
			await supabase.from("conversations").delete().eq("id", conversation.id);
			throw new Error("Failed to add participants to conversation");
		}

		return {
			conversationId: conversation.id,
			isNew: true,
		};
	});
