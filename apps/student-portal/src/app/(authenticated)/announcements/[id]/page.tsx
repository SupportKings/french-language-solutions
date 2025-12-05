import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { AnnouncementDetail } from "@/features/announcements/components/AnnouncementDetail";

import { getUser } from "@/queries/getUser";

interface AnnouncementDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function AnnouncementDetailPage({
	params,
}: AnnouncementDetailPageProps) {
	const { id } = await params;
	const session = await getUser();

	if (!session?.user) {
		redirect("/");
	}

	// Get student ID
	const supabase = await createClient();
	const { data: student } = await supabase
		.from("students")
		.select("id")
		.eq("user_id", session.user.id)
		.single();

	if (!student) {
		redirect("/?error=not_a_student");
	}

	// Fetch the announcement
	const { data: announcement, error } = await supabase
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
		.eq("id", id)
		.is("deleted_at", null)
		.single();

	if (error || !announcement) {
		redirect("/announcements");
	}

	// Check if student has access (school-wide or in their cohort)
	if (announcement.scope === "cohort") {
		const { data: enrollment } = await supabase
			.from("enrollments")
			.select("id")
			.eq("student_id", student.id)
			.eq("cohort_id", announcement.cohort_id)
			.in("status", ["paid", "welcome_package_sent"])
			.single();

		if (!enrollment) {
			redirect("/announcements?error=access_denied");
		}
	}

	// Check if already read
	const { data: readRecord } = await supabase
		.from("announcement_reads")
		.select("id")
		.eq("announcement_id", id)
		.eq("student_id", student.id)
		.single();

	const isRead = !!readRecord;

	return (
		<AnnouncementDetail
			announcement={announcement}
			studentId={student.id}
			isRead={isRead}
		/>
	);
}
