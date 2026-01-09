"use server";

import { requireAuth } from "@/lib/rbac-middleware";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";

import { z } from "zod";

const createOrGetConversationSchema = z.object({
	// No input needed - conversation created for current student with their teachers
});

/**
 * Create a new conversation or return existing one for the current student
 * Participants: student + their teachers (from enrollments) + all admins
 */
export const createOrGetConversation = actionClient
	.inputSchema(createOrGetConversationSchema)
	.action(async () => {
		const session = await requireAuth();
		const supabase = await createClient();

		// 1. Get student record for current user
		const { data: student, error: studentError } = await supabase
			.from("students")
			.select("id")
			.eq("user_id", session.user.id)
			.maybeSingle();

		if (studentError || !student) {
			throw new Error(
				"Only students can create private conversations with teachers",
			);
		}

		// 2. Get student's teachers via active enrollments
		const { data: enrollmentsData, error: enrollmentsError } = await supabase
			.from("enrollments")
			.select(
				`
				cohort_id,
				weekly_sessions!inner(
					teachers!inner(
						user_id
					)
				)
			`,
			)
			.eq("student_id", student.id)
			.in("status", [
				"paid",
				"welcome_package_sent",
				"transitioning",
				"offboarding",
			]);

		if (enrollmentsError) {
			throw new Error(`Failed to fetch teachers: ${enrollmentsError.message}`);
		}

		if (!enrollmentsData || enrollmentsData.length === 0) {
			throw new Error(
				"You need to be enrolled in a class to chat with teachers",
			);
		}

		// Deduplicate teacher user_ids
		const teacherUserIds = Array.from(
			new Set(
				enrollmentsData
					?.flatMap((e: any) =>
						e.weekly_sessions?.flatMap((ws: any) => ws.teachers?.user_id || []),
					)
					.filter(Boolean) || [],
			),
		);

		if (teacherUserIds.length === 0) {
			throw new Error("No teachers found for your active enrollments");
		}

		// 3. Get all admins (both admin and super_admin roles)
		const { data: admins, error: adminsError } = await supabase
			.from("user")
			.select("id")
			.in("role", ["admin", "super_admin"]);

		if (adminsError) {
			throw new Error(`Failed to fetch admins: ${adminsError.message}`);
		}

		const adminUserIds = admins?.map((a) => a.id) || [];

		// 4. Build expected participants list (student + teachers + admins)
		const expectedParticipantIds = new Set([
			session.user.id, // student
			...teacherUserIds, // teachers
			...adminUserIds, // admins
		]);

		// 5. Check for existing conversation with same participant set
		const { data: existingConversations, error: existingError } = await supabase
			.from("conversations")
			.select(
				`
					id,
					conversation_participants(user_id)
				`,
			)
			.is("deleted_at", null);

		if (existingError) {
			throw new Error(
				`Failed to check existing conversations: ${existingError.message}`,
			);
		}

		// Find a conversation where participants match exactly
		const matchingConversation = existingConversations?.find((conv: any) => {
			const participantIds = new Set(
				conv.conversation_participants.map((p: any) => p.user_id),
			);

			return (
				participantIds.size === expectedParticipantIds.size &&
				[...participantIds].every((id) => expectedParticipantIds.has(id))
			);
		});

		if (matchingConversation) {
			console.log("✅ Found existing conversation:", matchingConversation.id);
			return {
				success: true,
				data: {
					conversationId: matchingConversation.id,
					isNew: false,
				},
			};
		}

		// 6. Create new conversation
		console.log(
			"🔵 Creating new conversation with participants:",
			Array.from(expectedParticipantIds),
		);

		const { data: conversation, error: conversationError } = await supabase
			.from("conversations")
			.insert({})
			.select()
			.single();

		if (conversationError || !conversation) {
			throw new Error(
				`Failed to create conversation: ${conversationError?.message}`,
			);
		}

		// 7. Add all participants
		const participantsToInsert = Array.from(expectedParticipantIds).map(
			(userId) => ({
				conversation_id: conversation.id,
				user_id: userId,
			}),
		);

		const { error: participantsError } = await supabase
			.from("conversation_participants")
			.insert(participantsToInsert);

		if (participantsError) {
			// Rollback - delete the conversation
			await supabase.from("conversations").delete().eq("id", conversation.id);

			throw new Error(
				`Failed to add participants: ${participantsError.message}`,
			);
		}

		console.log("✅ Conversation created successfully:", conversation.id);

		return {
			success: true,
			data: {
				conversationId: conversation.id,
				isNew: true,
			},
		};
	});
