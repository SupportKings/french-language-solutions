import { requireAuth, isAdmin } from "@/lib/rbac-middleware";
import { createClient } from "@/lib/supabase/server";

export interface AccessibleCohort {
	id: string;
	name: string;
	description: string | null;
	language: string | null;
	level: string | null;
	startDate: string | null;
	endDate: string | null;
	status: string | null;
	lastMessageAt: string | null;
	lastMessageContent: string | null;
	unreadCount: number;
}

/**
 * Get all cohorts the current user has access to chat in
 * - Admins: all cohorts
 * - Teachers: cohorts they teach
 * - Students: cohorts they're enrolled in
 */
export async function getAccessibleCohorts(): Promise<AccessibleCohort[]> {
	const session = await requireAuth();
	const supabase = await createClient();

	let cohortIds: string[] = [];

	// Check if user is admin
	const userIsAdmin = await isAdmin(session);

	if (userIsAdmin) {
		// Admins can access all cohorts
		const { data: allCohorts } = await supabase
			.from("cohorts")
			.select("id")
			.order("created_at", { ascending: false });

		cohortIds = allCohorts?.map((c) => c.id) || [];
	} else {
		// Check if teacher
		const { data: teacher } = await supabase
			.from("teachers")
			.select("id")
			.eq("user_id", session.user.id)
			.maybeSingle();

		if (teacher) {
			// Get cohorts this teacher teaches
			const { data: sessions } = await supabase
				.from("weekly_sessions")
				.select("cohort_id")
				.eq("teacher_id", teacher.id);

			cohortIds = sessions?.map((s) => s.cohort_id) || [];
		} else {
			// Check if student
			const { data: student } = await supabase
				.from("students")
				.select("id")
				.eq("user_id", session.user.id)
				.maybeSingle();

			if (student) {
				// Get cohorts this student is enrolled in
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

				cohortIds = enrollments?.map((e) => e.cohort_id) || [];
			}
		}
	}

	if (cohortIds.length === 0) {
		return [];
	}

	// Fetch cohort details with last message info
	const { data: cohorts, error } = await supabase
		.from("cohorts")
		.select(
			`
      id,
      nickname,
      start_date,
      cohort_status
    `,
		)
		.in("id", cohortIds)
		.order("created_at", { ascending: false });

	if (error) {
		console.error("❌ Error fetching cohort details:", error);
		throw new Error(`Failed to fetch cohorts: ${error.message}`);
	}

	console.log("🔵 Fetched cohorts:", cohorts?.length, cohorts);

	// For each cohort, get the last message
	const cohortsWithMessages = await Promise.all(
		(cohorts || []).map(async (cohort) => {
			// Get last message for this cohort
			const { data: lastMessage } = await supabase
				.from("cohort_messages")
				.select("message_id, created_at")
				.eq("cohort_id", cohort.id)
				.order("created_at", { ascending: false })
				.limit(1)
				.maybeSingle();

			let lastMessageContent: string | null = null;
			let lastMessageAt: string | null = null;

			if (lastMessage) {
				const { data: message } = await supabase
					.from("messages")
					.select("content, created_at")
					.eq("id", lastMessage.message_id)
					.is("deleted_at", null)
					.maybeSingle();

				if (message) {
					lastMessageContent = message.content;
					lastMessageAt = message.created_at;
				}
			}

			// TODO: Calculate unread count based on message_reads table
			// For now, set to 0
			const unreadCount = 0;

			return {
				id: cohort.id,
				name: cohort.nickname || `Cohort ${cohort.id.slice(0, 8)}`,
				description: null,
				language: null,
				level: null,
				startDate: cohort.start_date,
				endDate: null,
				status: cohort.cohort_status,
				lastMessageAt,
				lastMessageContent,
				unreadCount,
			};
		}),
	);

	// Sort cohorts: prioritize those with messages (most recent first), then those without
	// - Admins: See all cohorts, with active ones (having messages) first
	// - Teachers: See only their cohorts, with active ones (having messages) first
	const result = cohortsWithMessages.sort((a, b) => {
		// Both have no messages - keep original order
		if (!a.lastMessageAt && !b.lastMessageAt) return 0;
		// a has no messages - push to bottom
		if (!a.lastMessageAt) return 1;
		// b has no messages - push to bottom
		if (!b.lastMessageAt) return -1;
		// Both have messages - sort by most recent first
		return (
			new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
		);
	});

	console.log("✅ Returning accessible cohorts:", result.length, result);
	return result;
}
