import { CohortForm } from "@/features/cohorts/components/CohortForm";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { languageLevelQueries } from "@/features/language-levels/queries/language-levels.queries";
import { getQueryClient } from "@/utils/queryClient"; // adjust to your helper path

export default async function NewCohortPage() {
	const qc = getQueryClient();
	await qc.prefetchQuery(languageLevelQueries.list());

	return (
		<HydrationBoundary state={dehydrate(qc)}>
			<CohortForm />
		</HydrationBoundary>
	);
}
