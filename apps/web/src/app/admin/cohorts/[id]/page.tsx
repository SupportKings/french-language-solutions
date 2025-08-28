import { notFound, redirect } from "next/navigation";

import { cohortsApi } from "@/features/cohorts/api/cohorts.api";
import { cohortsQueries } from "@/features/cohorts/queries/cohorts.queries";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { CohortDetailPageClient } from "./page-client";

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
