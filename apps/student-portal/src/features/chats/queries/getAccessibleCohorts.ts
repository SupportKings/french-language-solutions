import { requireAuth } from "@/lib/auth";
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
 * Get all cohorts the student has access to chat in
 * Returns only cohorts where the student has active enrollments
 */
export async function getAccessibleCohorts(): Promise<AccessibleCohort[]> {
	const user = await requireAuth();
	const supabase = await createClient();

	// Get student record
	const { data: student } = await supabase
		.from("students")
		.select("id")
		.eq("user_id", user.id)
		.maybeSingle();

	if (!student) {
		console.log("⚠️ User is not a student, returning empty array");
		return [];
	}

	// Get cohorts this student is enrolled in
	const { data: enrollments, error: enrollmentsError } = await supabase
		.from("enrollments")
		.select("cohort_id")
		.eq("student_id", student.id)
		.in("status", [
			"paid",
			"welcome_package_sent",
			"transitioning",
			"offboarding",
		]);

	if (enrollmentsError) {
		console.error("❌ Error fetching enrollments:", enrollmentsError);
		return [];
	}

	const cohortIds = enrollments?.map((e) => e.cohort_id).filter(Boolean) || [];
	console.log("🔵 Found cohort IDs for student:", cohortIds.length, cohortIds);

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

	// Sort by last message time (most recent first)
	const result = cohortsWithMessages.sort((a, b) => {
		if (!a.lastMessageAt && !b.lastMessageAt) return 0;
		if (!a.lastMessageAt) return 1;
		if (!b.lastMessageAt) return -1;
		return (
			new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
		);
	});

	console.log("✅ Returning accessible cohorts:", result.length, result);
	return result;
}
