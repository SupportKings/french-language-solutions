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
		await queryClient.prefetchQuery({
			queryKey: studentsKeys.detail(id),
			queryFn: () => studentsApi.getById(id),
		});
	} catch (error) {
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
