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
	const supabase = await createClient();

	const from = (page - 1) * limit;
	const to = from + limit - 1;

	// Build query with optional search filter
	// Only fetch cohorts that have messages by using inner join with cohort_messages
	// Also filter to exclude deleted messages at the database level
	let query = supabase
		.from("cohorts")
		.select(
			`
			id,
			nickname,
			cohort_messages!inner (
				messages!inner (
					content,
					created_at,
					deleted_at
				)
			)
		`,
			{ count: "exact" },
		)
		.is("cohort_messages.messages.deleted_at", null);

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
	// Database already filters to only include cohorts with non-deleted messages via INNER JOIN
	const transformedCohorts: SimpleCohort[] = (cohorts || [])
		.map((cohort: any) => {
			// Get all messages for this cohort and sort by date (deleted messages already filtered by database)
			const messages = (cohort.cohort_messages || [])
				.map((cm: any) => cm.messages)
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
