"use server";

import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";

const schema = z.object({
	teacherUserIds: z
		.array(z.string().uuid())
		.min(1, "At least one teacher required"),
});

export const createOrGetConversationForStudent = actionClient
	.inputSchema(schema)
	.action(async ({ parsedInput: input }) => {
		const user = await requireAuth();
		const supabase = await createClient();

		// Get student record
		const { data: student } = await supabase
			.from("students")
			.select("id")
			.eq("user_id", user.id)
			.single();

		if (!student) {
			throw new Error("Student not found");
		}

		// Get cohort IDs from student's enrollments
		const { data: enrollments } = await supabase
			.from("enrollments")
			.select("cohort_id")
			.eq("student_id", student.id)
			.in("status", [
				"paid",
				"welcome_package_sent",
				"transitioning",
				"offboarding",
			]);

		const cohortIds =
			enrollments?.map((e) => e.cohort_id).filter(Boolean) || [];

		if (cohortIds.length === 0) {
			throw new Error("No active enrollments found");
		}

		// Get teacher user_ids from weekly_sessions for these cohorts
		const { data: sessionsData } = await supabase
			.from("weekly_sessions")
			.select(
				`
      teachers!inner(user_id)
    `,
			)
			.in("cohort_id", cohortIds);

		const enrolledTeacherIds = new Set(
			sessionsData?.map((s: any) => s.teachers?.user_id).filter(Boolean) || [],
		);

		// Ensure all requested teachers are enrolled
		const invalidTeachers = input.teacherUserIds.filter(
			(id) => !enrolledTeacherIds.has(id),
		);

		if (invalidTeachers.length > 0) {
			throw new Error(
				"You can only create conversations with your enrolled teachers",
			);
		}

		// Check if conversation already exists with these participants
		const { data: existingConversations } = await supabase
			.from("conversations")
			.select(
				`
        id,
        student_id,
        conversation_participants(user_id, role)
      `,
			)
			.eq("student_id", student.id)
			.is("deleted_at", null);

		// Find matching conversation with same participant set
		const expectedParticipantIds = new Set([user.id, ...input.teacherUserIds]);

		const matchingConversation = existingConversations?.find((conv) => {
			const participantIds = new Set(
				conv.conversation_participants.map((p: any) => p.user_id),
			);
			return (
				participantIds.size === expectedParticipantIds.size &&
				[...participantIds].every((id) => expectedParticipantIds.has(id))
			);
		});

		if (matchingConversation) {
			return { conversationId: matchingConversation.id };
		}

		// Create new conversation
		const { data: conversation, error: convError } = await supabase
			.from("conversations")
			.insert({
				student_id: student.id,
				last_message_at: new Date().toISOString(),
			})
			.select("id")
			.single();

		if (convError || !conversation) {
			throw new Error("Failed to create conversation");
		}

		// Add participants (student + teachers)
		const participants = [
			{ conversation_id: conversation.id, user_id: user.id, role: "student" },
			...input.teacherUserIds.map((teacherId) => ({
				conversation_id: conversation.id,
				user_id: teacherId,
				role: "teacher",
			})),
		];

		const { error: participantsError } = await supabase
			.from("conversation_participants")
			.insert(participants);

		if (participantsError) {
			// Rollback conversation if participants fail
			await supabase.from("conversations").delete().eq("id", conversation.id);
			throw new Error("Failed to add conversation participants");
		}

		return { conversationId: conversation.id };
	});
