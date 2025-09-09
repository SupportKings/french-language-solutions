import { notFound, redirect } from "next/navigation";

import { automatedFollowUpsQueries } from "@/features/automated-follow-ups/queries/automated-follow-ups.queries";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { AutomatedFollowUpDetailPageClient } from "./page-client";

export default async function AutomatedFollowUpDetailPage({
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

	// Prefetch automated follow-up data
	try {
		await Promise.all([
			queryClient.prefetchQuery(automatedFollowUpsQueries.detail(id)),
		]);
	} catch (error) {
		notFound();
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<AutomatedFollowUpDetailPageClient followUpId={id} />
		</HydrationBoundary>
	);
}
