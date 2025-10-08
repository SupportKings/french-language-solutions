import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getApiUrl } from "@/lib/api-utils";
import { getUser } from "@/queries/getUser";
import { rolesMap } from "@/lib/permissions";
import { AccessDenied } from "@/components/ui/access-denied";

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
		// Return the status code along with null data
		return { data: null, status: response.status };
	}

	const data = await response.json();
	return { data, status: 200 };
}

export default async function StudentDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const session = await getUser();

	if (!session) {
		redirect("/signin");
	}

	// Get user's role and permissions
	const userRole = session.user.role || "teacher";
	const rolePermissions = rolesMap[userRole as keyof typeof rolesMap];
	const permissions = rolePermissions?.statements || {};

	const queryClient = new QueryClient();

	// Fetch directly with cookies like the working teachers page
	const result = await getStudent(id);

	// Handle different error cases
	if (!result.data) {
		if (result.status === 403) {
			// User doesn't have permission - show custom error page
			return (
				<AccessDenied
					message="You don't have permission to view this student's details. You can only access students in your assigned cohorts."
					backLink="/admin/students"
					backLinkText="Back to Students List"
				/>
			);
		}
		// Student not found - use default 404
		notFound();
	}

	const student = result.data;

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
				permissions={permissions}
			/>
		</HydrationBoundary>
	);
}
