import { createClient } from "@/lib/supabase/server";

export async function getUnreadChatCount(userId: string): Promise<number> {
	const supabase = await createClient();

	let cohortUnreadCount = 0;
	let dmUnreadCount = 0;

	// ============ COHORT MESSAGES UNREAD COUNT ============

	// Get student record
	const { data: student } = await supabase
		.from("students")
		.select("id")
		.eq("user_id", userId)
		.maybeSingle();

	if (student) {
		// Get student's enrolled cohorts (with valid statuses)
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

		if (cohortIds.length > 0) {
			// Get all cohort_messages for accessible cohorts
			const { data: cohortMessages } = await supabase
				.from("cohort_messages")
				.select("message_id")
				.in("cohort_id", cohortIds);

			const cohortMessageIds =
				cohortMessages?.map((cm) => cm.message_id).filter(Boolean) || [];

			if (cohortMessageIds.length > 0) {
				// Get all non-deleted messages
				const { data: messages } = await supabase
					.from("messages")
					.select("id")
					.in("id", cohortMessageIds)
					.is("deleted_at", null);

				if (messages && messages.length > 0) {
					const validCohortMessageIds = messages.map((m) => m.id);

					// Get read message IDs for this user
					const { data: readRecords } = await supabase
						.from("message_reads")
						.select("message_id")
						.eq("user_id", userId)
						.in("message_id", validCohortMessageIds);

					const readSet = new Set(readRecords?.map((r) => r.message_id) || []);

					cohortUnreadCount = validCohortMessageIds.filter(
						(id) => !readSet.has(id),
					).length;
				}
			}
		}
	}

	// ============ DIRECT MESSAGES UNREAD COUNT ============

	// Get user's conversations
	const { data: participations } = await supabase
		.from("conversation_participants")
		.select("conversation_id")
		.eq("user_id", userId);

	const conversationIds =
		participations?.map((p) => p.conversation_id).filter(Boolean) || [];

	if (conversationIds.length > 0) {
		// Get all direct messages for user's conversations (excluding own messages)
		const { data: directMessages } = await supabase
			.from("direct_messages")
			.select("message_id, messages!inner(id, deleted_at, user_id)")
			.in("conversation_id", conversationIds);

		// Filter to non-deleted messages from other users
		const validDMIds = (directMessages || [])
			.filter(
				(dm: any) =>
					dm.messages?.deleted_at === null && dm.messages?.user_id !== userId,
			)
			.map((dm: any) => dm.message_id);

		if (validDMIds.length > 0) {
			// Get read message IDs for this user
			const { data: readDMRecords } = await supabase
				.from("message_reads")
				.select("message_id")
				.eq("user_id", userId)
				.in("message_id", validDMIds);

			const readDMSet = new Set(readDMRecords?.map((r) => r.message_id) || []);

			dmUnreadCount = validDMIds.filter(
				(id: string) => !readDMSet.has(id),
			).length;
		}
	}

	return cohortUnreadCount + dmUnreadCount;
}
