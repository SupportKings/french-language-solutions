import { getQueryClient } from "@/utils/queryClient"; // adjust to your helper path

import { CohortForm } from "@/features/cohorts/components/CohortForm";
import { languageLevelQueries } from "@/features/language-levels/queries/language-levels.queries";
import { productQueries } from "@/features/products/queries/products.queries";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function NewCohortPage() {
	const qc = getQueryClient();
	await Promise.all([
		qc.prefetchQuery(languageLevelQueries.list()),
		qc.prefetchQuery(productQueries.all()),
	]);

	return (
		<HydrationBoundary state={dehydrate(qc)}>
			<CohortForm />
		</HydrationBoundary>
	);
}
