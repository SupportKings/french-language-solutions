import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface SimpleCohort {
	id: string;
	nickname: string | null;
	messageCount: number;
	lastMessage?: {
		content: string;
		createdAt: string;
	} | null;
}

interface GetAllCohortsParams {
	page?: number;
	limit?: number;
	searchQuery?: string;
}

export async function getAllCohorts({
	page = 1,
	limit = 20,
	searchQuery,
}: GetAllCohortsParams = {}) {
	const user = await requireAuth();
	const supabase = await createClient();

	const from = (page - 1) * limit;
	const to = from + limit - 1;

	// Get student record
	const { data: student } = await supabase
		.from("students")
		.select("id")
		.eq("user_id", user.id)
		.maybeSingle();

	if (!student) {
		// Not a student - return empty
		return {
			cohorts: [],
			total: 0,
			hasMore: false,
		};
	}

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

	const accessibleCohortIds = enrollments?.map((e) => e.cohort_id) || [];

	// If no accessible cohorts, return empty
	if (accessibleCohortIds.length === 0) {
		return {
			cohorts: [],
			total: 0,
			hasMore: false,
		};
	}

	// Build query with optional search filter
	// Use LEFT JOIN (!left) explicitly to include cohorts without messages
	// Deleted messages are filtered during transformation
	let query = supabase
		.from("cohorts")
		.select(
			`
			id,
			nickname,
			cohort_messages!left (
				messages!left (
					content,
					created_at,
					deleted_at
				)
			)
		`,
			{ count: "exact" },
		)
		.in("id", accessibleCohortIds);

	// Apply search filter if provided
	if (searchQuery) {
		query = query.ilike("nickname", `%${searchQuery}%`);
	}

	// Fetch cohorts with their last message
	const { data: cohorts, error, count } = await query.range(from, to);

	if (error) {
		console.error("❌ Error fetching cohorts:", error);
		throw new Error(`Failed to fetch cohorts: ${error.message}`);
	}

	// Transform the data to include only the last message
	// Filter out deleted messages and cohorts without any messages are included (messageCount = 0)
	const transformedCohorts: SimpleCohort[] = (cohorts || [])
		.map((cohort: any) => {
			// Get all non-deleted messages for this cohort and sort by date (most recent first)
			const messages = (cohort.cohort_messages || [])
				.map((cm: any) => cm.messages)
				.filter((message: any) => message && message.deleted_at === null)
				.sort(
					(a: any, b: any) =>
						new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
				);

			const lastMessage = messages[0];

			return {
				id: cohort.id,
				nickname: cohort.nickname,
				messageCount: messages.length,
				lastMessage: lastMessage
					? {
							content: lastMessage.content,
							createdAt: lastMessage.created_at,
						}
					: null,
			};
		})
		// Sort cohorts by last message time (most recent first)
		.sort((a: SimpleCohort, b: SimpleCohort) => {
			if (!a.lastMessage && !b.lastMessage) return 0;
			if (!a.lastMessage) return 1;
			if (!b.lastMessage) return -1;
			return (
				new Date(b.lastMessage.createdAt).getTime() -
				new Date(a.lastMessage.createdAt).getTime()
			);
		});

	return {
		cohorts: transformedCohorts,
		total: count || 0,
		hasMore: (count || 0) > page * limit,
	};
}
