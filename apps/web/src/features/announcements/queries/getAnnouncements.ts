import { createClient } from "@/lib/supabase/server";

import type { Database } from "@/utils/supabase/database.types";

type AnnouncementScope = Database["public"]["Enums"]["announcement_scope"];

export interface AnnouncementFilters {
	scope?: AnnouncementScope;
	cohortId?: string;
	authorId?: string;
	isPinned?: boolean;
}

export interface AnnouncementWithDetails {
	id: string;
	title: string;
	content: string;
	scope: AnnouncementScope;
	cohort_id: string | null;
	is_pinned: boolean;
	created_at: string;
	updated_at: string;
	author: {
		id: string;
		name: string;
		email: string;
	} | null;
	cohort: {
		id: string;
		nickname: string | null;
	} | null;
	attachments: Array<{
		id: string;
		file_name: string;
		file_url: string;
		file_type: string;
		file_size: number;
	}>;
	_count: {
		reads: number;
	};
}

export async function getAnnouncements(filters?: AnnouncementFilters) {
	const supabase = await createClient();

	let query = supabase
		.from("announcements")
		.select(
			`
      *,
      author:user!announcements_author_id_fkey(
        id,
        name,
        email
      ),
      cohort:cohorts!announcements_cohort_id_fkey(
        id,
        nickname
      ),
      attachments:announcement_attachments(
        id,
        file_name,
        file_url,
        file_type,
        file_size
      )
    `,
		)
		.is("deleted_at", null)
		.order("is_pinned", { ascending: false })
		.order("created_at", { ascending: false });

	// Apply filters
	if (filters?.scope) {
		query = query.eq("scope", filters.scope);
	}

	if (filters?.cohortId) {
		query = query.eq("cohort_id", filters.cohortId);
	}

	if (filters?.authorId) {
		query = query.eq("author_id", filters.authorId);
	}

	if (filters?.isPinned !== undefined) {
		query = query.eq("is_pinned", filters.isPinned);
	}

	const { data, error } = await query;

	if (error) {
		throw new Error(`Failed to fetch announcements: ${error.message}`);
	}

	// Fetch read counts for each announcement
	const announcementsWithCounts = await Promise.all(
		(data || []).map(async (announcement) => {
			const { count } = await supabase
				.from("announcement_reads")
				.select("*", { count: "exact", head: true })
				.eq("announcement_id", announcement.id);

			return {
				...announcement,
				_count: {
					reads: count || 0,
				},
			};
		}),
	);

	return announcementsWithCounts as AnnouncementWithDetails[];
}
