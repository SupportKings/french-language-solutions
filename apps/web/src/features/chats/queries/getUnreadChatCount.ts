import { isAdmin, requireAuth } from "@/lib/rbac-middleware";
import { createClient } from "@/lib/supabase/server";

export async function getUnreadChatCount(userId: string): Promise<number> {
	const session = await requireAuth();
	const supabase = await createClient();

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

	if (accessibleCohortIds.length === 0) {
		return 0;
	}

	// Get all cohort_messages for accessible cohorts
	const { data: cohortMessages } = await supabase
		.from("cohort_messages")
		.select("message_id")
		.in("cohort_id", accessibleCohortIds);

	const messageIds =
		cohortMessages?.map((cm) => cm.message_id).filter(Boolean) || [];

	if (messageIds.length === 0) {
		return 0;
	}

	// Get non-deleted messages
	const { data: messages } = await supabase
		.from("messages")
		.select("id")
		.in("id", messageIds)
		.is("deleted_at", null);

	const validMessageIds = messages?.map((m) => m.id) || [];

	if (validMessageIds.length === 0) {
		return 0;
	}

	// Get already read messages for this user
	const { data: readMessages } = await supabase
		.from("message_reads")
		.select("message_id")
		.eq("user_id", userId)
		.in("message_id", validMessageIds);

	const readMessageIds = new Set(readMessages?.map((r) => r.message_id) || []);

	// Count unread messages
	const unreadCount = validMessageIds.filter(
		(id) => !readMessageIds.has(id),
	).length;

	return unreadCount;
}
