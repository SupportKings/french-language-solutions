import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getUser } from "@/queries/getUser";
import { redirect } from "next/navigation";
import { ClassesPageClient } from "./page-client";
import { cohortsQueries } from "@/features/cohorts/queries/cohorts.queries";

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
		search: params.search as string | undefined,
		format: params.format as any,
		cohort_status: params.cohort_status as any,
		starting_level: params.starting_level as any,
		current_level: params.current_level as any,
		room_type: params.room_type as any,
		page: params.page ? parseInt(params.page as string) : 1,
		limit: params.limit ? parseInt(params.limit as string) : 10,
	};

	// Prefetch cohorts data
	console.log("🏃 Server-side prefetching with filters:", filters);
	try {
		await queryClient.prefetchQuery(cohortsQueries.list(filters));
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