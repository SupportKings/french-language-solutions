import { createClient } from "@/lib/supabase/server";

export async function getUnreadChatCount(userId: string): Promise<number> {
	const supabase = await createClient();

	// Get student record
	const { data: student } = await supabase
		.from("students")
		.select("id")
		.eq("user_id", userId)
		.maybeSingle();

	if (!student) {
		return 0;
	}

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

	const cohortIds = enrollments?.map((e) => e.cohort_id).filter(Boolean) || [];

	if (cohortIds.length === 0) {
		return 0;
	}

	// Get all cohort_messages for accessible cohorts
	const { data: cohortMessages } = await supabase
		.from("cohort_messages")
		.select("message_id")
		.in("cohort_id", cohortIds);

	const messageIds =
		cohortMessages?.map((cm) => cm.message_id).filter(Boolean) || [];

	if (messageIds.length === 0) {
		return 0;
	}

	// Get all non-deleted messages
	const { data: messages } = await supabase
		.from("messages")
		.select("id")
		.in("id", messageIds)
		.is("deleted_at", null);

	if (!messages || messages.length === 0) {
		return 0;
	}

	const validMessageIds = messages.map((m) => m.id);

	// Get read message IDs for this user
	const { data: readRecords } = await supabase
		.from("message_reads")
		.select("message_id")
		.eq("user_id", userId)
		.in("message_id", validMessageIds);

	const readSet = new Set(readRecords?.map((r) => r.message_id) || []);

	// Count unread messages
	return validMessageIds.filter((id) => !readSet.has(id)).length;
}
