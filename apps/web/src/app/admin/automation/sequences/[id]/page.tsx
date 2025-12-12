import { sequencesQueries } from "@/features/sequences/queries/sequences.queries";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { SequenceDetailPageClient } from "./page-client";
export default async function SequenceDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const queryClient = new QueryClient();
	await Promise.all([
		queryClient.prefetchQuery(sequencesQueries.detail(id)),
		// TODO: fetch session once here if required by downstream components
	]);
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<SequenceDetailPageClient sequenceId={id} />
		</HydrationBoundary>
	);
}
