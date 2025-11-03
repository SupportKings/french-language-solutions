import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { getApiUrl } from "@/lib/api-utils";

import { AccessDenied } from "@/components/ui/access-denied";

import { EnrollmentFormNew } from "@/features/enrollments/components/EnrollmentFormNew";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

async function getEnrollment(id: string) {
	const response = await fetch(getApiUrl(`/api/enrollments/${id}`), {
		cache: "no-store",
		headers: { cookie: (await headers()).get("cookie") ?? "" },
	});

	if (!response.ok) {
		return { data: null, status: response.status };
	}

	const data = await response.json();
	return { data, status: 200 };
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
	const result = await getEnrollment(id);

	if (!result.data) {
		if (result.status === 403) {
			return (
				<AccessDenied
					message="You don't have permission to edit this enrollment."
					backLink="/admin/students"
					backLinkText="Back to Students List"
				/>
			);
		}
		notFound();
	}

	const queryClient = new QueryClient();

	await queryClient.prefetchQuery({
		queryKey: ["enrollment", id],
		queryFn: () => result.data,
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<EnrollmentFormNew enrollment={result.data} redirectTo={redirectTo} />
		</HydrationBoundary>
	);
}
