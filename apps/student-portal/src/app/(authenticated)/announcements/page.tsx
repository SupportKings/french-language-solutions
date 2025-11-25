import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { AnnouncementsPageClient } from "@/features/announcements/components";
import { announcementQueries } from "@/features/announcements/queries";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

export default async function AnnouncementsPage() {
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

	// Prefetch announcements
	const queryClient = new QueryClient();
	await queryClient.prefetchQuery(
		announcementQueries.studentAnnouncements(student.id),
	);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<AnnouncementsPageClient studentId={student.id} />
		</HydrationBoundary>
	);
}
