import { notFound } from "next/navigation";

import { studentsApi } from "@/features/students/api/students.api";
import { studentsKeys } from "@/features/students/queries/students.queries";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import StudentDetailsClient from "./page-client";

export default async function StudentDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const queryClient = new QueryClient();

	try {
		// Log for debugging on Vercel
		console.log("[StudentDetailPage] Fetching student with ID:", id);
		console.log("[StudentDetailPage] VERCEL_URL:", process.env.VERCEL_URL);
		console.log("[StudentDetailPage] NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL);
		
		await queryClient.prefetchQuery({
			queryKey: studentsKeys.detail(id),
			queryFn: () => studentsApi.getById(id),
		});
	} catch (error) {
		console.error("[StudentDetailPage] Error fetching student:", error);
		notFound();
	}

	const student = queryClient.getQueryData(studentsKeys.detail(id));

	if (!student) {
		notFound();
	}

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
