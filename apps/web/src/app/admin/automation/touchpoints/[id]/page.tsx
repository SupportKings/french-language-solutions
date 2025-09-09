import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { getApiUrl } from "@/lib/api-utils";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import TouchpointDetailsClient from "./page-client";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const dynamicParams = true;

async function getTouchpoint(id: string) {
	const response = await fetch(getApiUrl(`/api/touchpoints/${id}`), {
		cache: "no-store",
		headers: { cookie: (await headers()).get("cookie") ?? "" },
	});

	if (!response.ok) {
		return null;
	}

	return response.json();
}

export default async function TouchpointDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const queryClient = new QueryClient();

	// Fetch touchpoint with related data
	const touchpoint = await getTouchpoint(id);

	if (!touchpoint) {
		notFound();
	}

	// Prefetch for client-side navigation
	await queryClient.prefetchQuery({
		queryKey: ["touchpoints", "detail", id],
		queryFn: () => Promise.resolve(touchpoint),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<TouchpointDetailsClient touchpoint={touchpoint} />
		</HydrationBoundary>
	);
}
