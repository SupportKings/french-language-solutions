"use server";

import { actionClient } from "@/lib/safe-action";
import {
	requireAuth,
	isAdmin,
	isTeacher,
	getTeacherIdFromSession,
} from "@/lib/rbac-middleware";
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
		// Verify user is authenticated
		const session = await requireAuth();
		const supabase = await createClient();

		// Add current user to participants if not already included
		const allParticipantIds = Array.from(
			new Set([...parsedInput.participantIds, session.user.id]),
		);

		// Validate permissions based on role
		const userIsAdmin = await isAdmin(session);

		if (!userIsAdmin) {
			const userIsTeacher = await isTeacher(session);

			if (!userIsTeacher) {
				throw new Error(
					"FORBIDDEN: Only admins and teachers can create conversations",
				);
			}

			// Teacher validation: can only message other teachers + their students
			const teacherId = await getTeacherIdFromSession(session);

			if (!teacherId) {
				throw new Error("FORBIDDEN: Teacher record not found");
			}

			// Get teacher's cohort IDs
			const { data: weeklySessions } = await supabase
				.from("weekly_sessions")
				.select("cohort_id")
				.eq("teacher_id", teacherId);

			const cohortIds = weeklySessions?.map((ws) => ws.cohort_id) || [];

			// Get student user IDs from teacher's cohorts
			const { data: enrollments } = await supabase
				.from("enrollments")
				.select(
					`
          students!inner(user_id)
        `,
				)
				.in("cohort_id", cohortIds)
				.in("status", [
					"paid",
					"welcome_package_sent",
					"transitioning",
					"offboarding",
				]);

			const accessibleStudentUserIds = new Set(
				enrollments?.map((e: any) => e.students?.user_id).filter(Boolean) ||
					[],
			);

			// Check all participants (except current user)
			const otherParticipantIds = parsedInput.participantIds.filter(
				(id) => id !== session.user.id,
			);

			for (const participantId of otherParticipantIds) {
				const { data: participant } = await supabase
					.from("user")
					.select("role")
					.eq("id", participantId)
					.single();

				if (!participant) {
					throw new Error(`FORBIDDEN: Invalid participant ${participantId}`);
				}

				// Teachers can message: other teachers, their students (NOT admins)
				const isAllowed =
					participant.role === "teacher" ||
					(participant.role === "student" &&
						accessibleStudentUserIds.has(participantId));

				if (!isAllowed) {
					throw new Error(
						"FORBIDDEN: Teachers cannot message admins or students outside their cohorts",
					);
				}
			}
		}

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
