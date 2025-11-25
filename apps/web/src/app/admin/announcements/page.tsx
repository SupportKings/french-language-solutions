import { redirect } from "next/navigation";

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

	const queryClient = new QueryClient();

	// Prefetch announcements
	await queryClient.prefetchQuery(announcementsQueries.list());

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<AnnouncementsPageClient />
		</HydrationBoundary>
	);
}
