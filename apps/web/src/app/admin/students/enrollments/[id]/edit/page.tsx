import { notFound } from "next/navigation";

import { getApiUrl } from "@/lib/api-utils";

import { EnrollmentFormNew } from "@/features/enrollments/components/EnrollmentFormNew";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

async function getEnrollment(id: string) {
	const response = await fetch(getApiUrl(`/api/enrollments/${id}`), {
		cache: "no-store",
	});

	if (!response.ok) {
		return null;
	}

	return response.json();
}

export default async function EditEnrollmentPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ redirectTo?: string }>;
}) {
	const { id } = await params;
	const { redirectTo } = await searchParams;
	const enrollment = await getEnrollment(id);

	if (!enrollment) {
		notFound();
	}

	const queryClient = new QueryClient();

	await queryClient.prefetchQuery({
		queryKey: ["enrollment", id],
		queryFn: () => enrollment,
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<EnrollmentFormNew enrollment={enrollment} redirectTo={redirectTo} />
		</HydrationBoundary>
	);
}
