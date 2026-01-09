import { redirect } from "next/navigation";

import { rolesMap } from "@/lib/permissions";

import { announcementsQueries } from "@/features/announcements/queries/announcements.queries";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { AnnouncementsPageClient } from "./page-client";

export default async function AnnouncementsPage() {
	const session = await getUser();
	if (!session) {
		redirect("/signin");
	}

	// Get user's role and check if they can post school-wide announcements
	// Only admins and super_admins can post school-wide announcements
	const userRole = session.user.role || "teacher";
	const canPostSchoolWide = userRole === "admin" || userRole === "super_admin";

	const queryClient = new QueryClient();

	// Prefetch announcements
	await queryClient.prefetchQuery(announcementsQueries.list());

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<AnnouncementsPageClient
				userId={session.user.id}
				canPostSchoolWide={canPostSchoolWide}
			/>
		</HydrationBoundary>
	);
}
