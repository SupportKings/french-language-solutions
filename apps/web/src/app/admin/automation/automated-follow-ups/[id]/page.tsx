import { notFound, redirect } from "next/navigation";

import { automatedFollowUpsApi } from "@/features/follow-ups/api/follow-ups.api";
import { automatedFollowUpsKeys } from "@/features/follow-ups/queries/follow-ups.queries";

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
			queryClient.prefetchQuery({
				queryKey: automatedFollowUpsKeys.detail(id),
				queryFn: () => automatedFollowUpsApi.getById(id),
			}),
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