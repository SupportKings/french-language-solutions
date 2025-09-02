import { getQueryClient } from "@/utils/queryClient"; // adjust to your helper path

import { CohortForm } from "@/features/cohorts/components/CohortForm";
import { languageLevelQueries } from "@/features/language-levels/queries/language-levels.queries";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function NewCohortPage() {
	const qc = getQueryClient();
	await qc.prefetchQuery(languageLevelQueries.list());

	return (
		<HydrationBoundary state={dehydrate(qc)}>
			<CohortForm />
		</HydrationBoundary>
	);
}
