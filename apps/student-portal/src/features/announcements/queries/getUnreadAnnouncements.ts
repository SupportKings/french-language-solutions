import { createClient } from "@/lib/supabase/client";
import type { StudentAnnouncement } from "./getStudentAnnouncements";

function formatCohortDisplayName(cohort: {
	language_levels?: { display_name?: string } | null;
	products?: { format?: string } | null;
} | null): string | undefined {
	if (!cohort) return undefined;

	const level = cohort.language_levels?.display_name || "";
	const format = cohort.products?.format
		? cohort.products.format.charAt(0).toUpperCase() + cohort.products.format.slice(1)
		: "";

	if (level && format) {
		return `${level} • ${format} Class`;
	}
	if (level) return level;
	if (format) return `${format} Class`;
	return undefined;
}

export async function getUnreadAnnouncements(
	studentId: string,
): Promise<StudentAnnouncement[]> {
	const supabase = createClient();

	// Get student's active enrollments
	const { data: enrollments, error: enrollmentsError } = await supabase
		.from("enrollments")
		.select("cohort_id")
		.eq("student_id", studentId)
		.in("status", ["paid", "welcome_package_sent", "transitioning", "offboarding"]);

	if (enrollmentsError) {
		console.error("Error fetching enrollments:", enrollmentsError);
		throw new Error("Failed to fetch enrollments");
	}

	const cohortIds = enrollments?.map((e) => e.cohort_id).filter(Boolean) || [];

	// Fetch announcements (school-wide OR in student's cohorts)
	let query = supabase
		.from("announcements")
		.select(
			`
      *,
      author:user!announcements_author_id_fkey(
        id,
        name,
        email,
        image
      ),
      cohort:cohorts!announcements_cohort_id_fkey(
        id,
        current_level_id,
        language_levels!cohorts_current_level_id_language_levels_id_fk(
          display_name
        ),
        products!cohorts_product_id_products_id_fk(
          format
        )
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

	// Filter: school-wide OR in student's cohorts
	if (cohortIds.length > 0) {
		query = query.or(
			`scope.eq.school_wide,cohort_id.in.(${cohortIds.join(",")})`,
		);
	} else {
		// If student has no cohorts, only show school-wide
		query = query.eq("scope", "school_wide");
	}

	const { data: announcements, error: announcementsError } = await query;

	if (announcementsError) {
		console.error("Error fetching announcements:", announcementsError);
		throw new Error("Failed to fetch announcements");
	}

	// Fetch read statuses for these announcements
	const announcementIds = announcements?.map((a) => a.id) || [];
	const { data: reads } = await supabase
		.from("announcement_reads")
		.select("announcement_id")
		.eq("student_id", studentId)
		.in("announcement_id", announcementIds);

	const readSet = new Set(reads?.map((r) => r.announcement_id) || []);

	// Transform to StudentAnnouncement format and filter unread only
	return (announcements || [])
		.filter((announcement) => !readSet.has(announcement.id))
		.map((announcement) => ({
			id: announcement.id,
			title: announcement.title,
			content: announcement.content,
			author: {
				id: announcement.author?.id || "",
				name: announcement.author?.name || "Unknown",
				role: "teacher" as const,
				avatar: announcement.author?.image || undefined,
			},
			scope: announcement.scope,
			cohortId: announcement.cohort_id || undefined,
			cohortName: formatCohortDisplayName(announcement.cohort),
			isPinned: announcement.is_pinned,
			isRead: false, // All are unread
			createdAt: announcement.created_at,
			attachments: announcement.attachments?.map((att: any) => ({
				id: att.id,
				name: att.file_name,
				url: att.file_url,
				type: att.file_type as "image" | "video" | "document",
			})),
		}));
}
