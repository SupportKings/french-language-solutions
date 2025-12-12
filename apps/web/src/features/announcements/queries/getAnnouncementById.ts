import { createClient } from "@/lib/supabase/server";

import type { AnnouncementWithDetails } from "./getAnnouncements";

export async function getAnnouncementById(id: string) {
	const supabase = await createClient();

	const { data, error } = await supabase
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
		.eq("id", id)
		.is("deleted_at", null)
		.single();

	if (error) {
		throw new Error(`Failed to fetch announcement: ${error.message}`);
	}

	// Fetch read count
	const { count } = await supabase
		.from("announcement_reads")
		.select("*", { count: "exact", head: true })
		.eq("announcement_id", id);

	return {
		...data,
		_count: {
			reads: count || 0,
		},
	} as AnnouncementWithDetails;
}
