import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/queries/getUser";
import { CohortDetailPageClient } from "./page-client";
import { cohortsQueries } from "@/features/cohorts/queries/cohorts.queries";
import { cohortsApi } from "@/features/cohorts/api/cohorts.api";

export default async function CohortDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const session = await getUser();
	if (!session) {
		redirect("/signin");
	}

	const queryClient = new QueryClient();

	// Prefetch cohort data
	try {
		await Promise.all([
			queryClient.prefetchQuery(cohortsQueries.detail(id)),
			queryClient.prefetchQuery(cohortsQueries.withSessions(id)),
		]);
	} catch (error) {
		notFound();
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<CohortDetailPageClient cohortId={id} />
		</HydrationBoundary>
	);
}