import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { getApiUrl } from "@/lib/api-utils";
import { studentsKeys } from "@/features/students/queries/students.queries";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import StudentDetailsClient from "./page-client";

// Force dynamic rendering to ensure params work correctly on Vercel
export const dynamic = "force-dynamic";
export const dynamicParams = true;

async function getStudent(id: string) {
	const response = await fetch(getApiUrl(`/api/students/${id}`), {
		cache: "no-store",
		headers: { cookie: (await headers()).get("cookie") ?? "" },
	});

	if (!response.ok) {
		return null;
	}

	return response.json();
}

export default async function StudentDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const queryClient = new QueryClient();

	// Fetch directly with cookies like the working teachers page
	const student = await getStudent(id);

	if (!student) {
		notFound();
	}

	// Prefetch for client-side navigation
	await queryClient.prefetchQuery({
		queryKey: studentsKeys.detail(id),
		queryFn: () => Promise.resolve(student),
	});

	// Calculate student metrics (would come from actual data)
	const enrollmentCount = 1; // Would be calculated from actual enrollments
	const assessmentCount = 0; // Would be calculated from actual assessments

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<StudentDetailsClient
				student={student}
				enrollmentCount={enrollmentCount}
				assessmentCount={assessmentCount}
			/>
		</HydrationBoundary>
	);
}
