import { redirect } from "next/navigation";

import { cohortsQueries } from "@/features/cohorts/queries/cohorts.queries";
import { teachersQueries } from "@/features/teachers/queries/teachers.queries";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { ClassesPageClient } from "./page-client";

export default async function ClassesPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const session = await getUser();
	if (!session) {
		redirect("/signin");
	}

	const queryClient = new QueryClient();
	const params = await searchParams;

	// Parse search params for cohort filters
	const filters = {
		search: params.search as any,
		format: params.format as any,
		location: params.location as any,
		cohort_status: params.cohort_status as any,
		setup_finalized: params.setup_finalized as any,
		starting_level: params.starting_level as any,
		current_level: params.current_level as any,
		room_type: params.room_type as any,
		teacher_ids: params.teacher_ids as any,
		start_date_from: params.start_date_from as any,
		start_date_to: params.start_date_to as any,
		page: params.page ? Number.parseInt(params.page as string) : 1,
		limit: params.limit ? Number.parseInt(params.limit as string) : 20,
	};

	// Prefetch data in parallel
	console.log("🏃 Server-side prefetching with filters:", filters);
	try {
		await Promise.all([
			queryClient.prefetchQuery(cohortsQueries.list(filters)),
			queryClient.prefetchQuery(teachersQueries.list()),
		]);
		console.log("✅ Server prefetch successful");
	} catch (error) {
		console.error("❌ Server prefetch failed:", error);
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ClassesPageClient />
		</HydrationBoundary>
	);
}
