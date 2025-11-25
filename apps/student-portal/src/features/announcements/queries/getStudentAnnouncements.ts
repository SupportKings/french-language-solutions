import { createClient } from "@/lib/supabase/client";

export interface StudentAnnouncement {
	id: string;
	title: string;
	content: string;
	author: {
		id: string;
		name: string;
		role: "admin" | "teacher";
		avatar?: string;
	};
	scope: "school_wide" | "cohort";
	cohortId?: string;
	cohortName?: string;
	isPinned: boolean;
	isRead: boolean;
	createdAt: string;
	attachments?: Array<{
		id: string;
		name: string;
		url: string;
		type: "image" | "video" | "document";
	}>;
}

export async function getStudentAnnouncements(
	studentId: string,
): Promise<StudentAnnouncement[]> {
	const supabase = createClient();

	// Get student's active enrollments
	const { data: enrollments, error: enrollmentsError } = await supabase
		.from("enrollments")
		.select("cohort_id")
		.eq("student_id", studentId)
		.in("status", ["paid", "welcome_package_sent"]); // Active statuses

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
      author:teachers!announcements_author_id_fkey(
        id,
        first_name,
        last_name,
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

	// Transform to StudentAnnouncement format
	return (announcements || []).map((announcement) => ({
		id: announcement.id,
		title: announcement.title,
		content: announcement.content,
		author: {
			id: announcement.author?.id || "",
			name: announcement.author
				? `${announcement.author.first_name} ${announcement.author.last_name}`
				: "Unknown",
			role: "teacher" as const,
			avatar: undefined,
		},
		scope: announcement.scope,
		cohortId: announcement.cohort_id || undefined,
		cohortName: announcement.cohort?.nickname || undefined,
		isPinned: announcement.is_pinned,
		isRead: readSet.has(announcement.id),
		createdAt: announcement.created_at,
		attachments: announcement.attachments?.map((att: any) => ({
			id: att.id,
			name: att.file_name,
			url: att.file_url,
			type: att.file_type as "image" | "video" | "document",
		})),
	}));
}
