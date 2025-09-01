import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { AssessmentFormNew } from "@/features/assessments/components/AssessmentFormNew";
import { getApiUrl } from "@/lib/api-utils";

async function getAssessment(id: string) {
	const response = await fetch(getApiUrl(`/api/assessments/${id}`), {
		cache: "no-store",
	});

	if (!response.ok) {
		return null;
	}

	return response.json();
}

export default async function EditAssessmentPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const assessment = await getAssessment(id);

	if (!assessment) {
		notFound();
	}

	const queryClient = new QueryClient();

	await queryClient.prefetchQuery({
		queryKey: ["assessment", id],
		queryFn: () => assessment,
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<AssessmentFormNew assessment={assessment} />
		</HydrationBoundary>
	);
}