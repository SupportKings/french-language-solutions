import { createClient } from "@/lib/supabase/server";

export async function getUnreadAnnouncementCount(
	studentId: string,
): Promise<number> {
	const supabase = await createClient();

	// Get student's cohort enrollments
	const { data: enrollments } = await supabase
		.from("enrollments")
		.select("cohort_id")
		.eq("student_id", studentId)
		.in("status", ["paid", "welcome_package_sent", "transitioning", "offboarding"]);

	const cohortIds = enrollments?.map((e) => e.cohort_id).filter(Boolean) || [];

	// Fetch announcements (school-wide OR in student's cohorts)
	let query = supabase
		.from("announcements")
		.select("id", { count: "exact", head: false })
		.is("deleted_at", null);

	if (cohortIds.length > 0) {
		query = query.or(
			`scope.eq.school_wide,cohort_id.in.(${cohortIds.join(",")})`,
		);
	} else {
		query = query.eq("scope", "school_wide");
	}

	const { data: announcements } = await query;

	if (!announcements) {
		return 0;
	}

	// Get read status for this student
	const { data: readRecords } = await supabase
		.from("announcement_reads")
		.select("announcement_id")
		.eq("student_id", studentId)
		.in(
			"announcement_id",
			announcements.map((a) => a.id),
		);

	const readSet = new Set(readRecords?.map((r) => r.announcement_id) || []);

	// Count unread announcements
	return announcements.filter((a) => !readSet.has(a.id)).length;
}
