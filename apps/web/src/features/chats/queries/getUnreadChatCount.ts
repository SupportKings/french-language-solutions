import { isAdmin, requireAuth } from "@/lib/rbac-middleware";
import { createClient } from "@/lib/supabase/server";

export async function getUnreadChatCount(userId: string): Promise<number> {
	const session = await requireAuth();
	const supabase = await createClient();

	let cohortUnreadCount = 0;
	let dmUnreadCount = 0;

	// ============ COHORT MESSAGES UNREAD COUNT ============

	// Get accessible cohort IDs based on user role
	let accessibleCohortIds: string[] = [];

	const userIsAdmin = await isAdmin(session);

	if (userIsAdmin) {
		// Admins can see all cohorts - get all cohort IDs
		const { data: allCohorts } = await supabase.from("cohorts").select("id");
		accessibleCohortIds = allCohorts?.map((c) => c.id) || [];
	} else {
		// Check if teacher
		const { data: teacher } = await supabase
			.from("teachers")
			.select("id")
			.eq("user_id", userId)
			.maybeSingle();

		if (teacher) {
			// Get cohorts this teacher teaches
			const { data: sessions } = await supabase
				.from("weekly_sessions")
				.select("cohort_id")
				.eq("teacher_id", teacher.id);

			accessibleCohortIds = sessions?.map((s) => s.cohort_id) || [];
		}
	}

	if (accessibleCohortIds.length > 0) {
		// Get all cohort_messages for accessible cohorts
		const { data: cohortMessages } = await supabase
			.from("cohort_messages")
			.select("message_id")
			.in("cohort_id", accessibleCohortIds);

		const cohortMessageIds =
			cohortMessages?.map((cm) => cm.message_id).filter(Boolean) || [];

		if (cohortMessageIds.length > 0) {
			// Get non-deleted messages
			const { data: messages } = await supabase
				.from("messages")
				.select("id")
				.in("id", cohortMessageIds)
				.is("deleted_at", null);

			const validCohortMessageIds = messages?.map((m) => m.id) || [];

			if (validCohortMessageIds.length > 0) {
				// Get already read messages for this user
				const { data: readMessages } = await supabase
					.from("message_reads")
					.select("message_id")
					.eq("user_id", userId)
					.in("message_id", validCohortMessageIds);

				const readMessageIds = new Set(
					readMessages?.map((r) => r.message_id) || [],
				);

				cohortUnreadCount = validCohortMessageIds.filter(
					(id) => !readMessageIds.has(id),
				).length;
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
