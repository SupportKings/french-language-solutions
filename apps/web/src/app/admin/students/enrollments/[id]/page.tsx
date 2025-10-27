import { Suspense } from "react";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getApiUrl } from "@/lib/api-utils";
import EnrollmentDetailSkeleton from "@/features/enrollments/components/enrollment.detail.skeleton";
import EnrollmentDetailView from "@/features/enrollments/components/enrollment.detail.view";

import { getUser } from "@/queries/getUser";
import { rolesMap } from "@/lib/permissions";
import { AccessDenied } from "@/components/ui/access-denied";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

interface EnrollmentDetailPageProps {
	params: Promise<{
		id: string;
	}>;
}

async function getEnrollment(id: string) {
	const response = await fetch(getApiUrl(`/api/enrollments/${id}`), {
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

export default function EnrollmentDetailPage({
	params,
}: EnrollmentDetailPageProps) {
	return (
		<Suspense fallback={<EnrollmentDetailSkeleton enrollmentId="" />}>
			<EnrollmentDetailPageAsync params={params} />
		</Suspense>
	);
}

async function EnrollmentDetailPageAsync({
	params,
}: EnrollmentDetailPageProps) {
	const { id } = await params;

	// Validate that id is provided
	if (!id) {
		notFound();
	}

	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// Get user's role and permissions
	const userRole = session.user.role || "teacher";
	const rolePermissions = rolesMap[userRole as keyof typeof rolesMap];
	const permissions = rolePermissions?.statements || {};

	// Fetch enrollment data
	const result = await getEnrollment(id);

	// Handle different error cases
	if (!result.data) {
		if (result.status === 403) {
			return (
				<AccessDenied
					message="You don't have permission to view this enrollment."
					backLink="/admin/students"
					backLinkText="Back to Students List"
				/>
			);
		}
		notFound();
	}

	const queryClient = new QueryClient();

	// Prefetch the enrollment data for React Query
	await queryClient.prefetchQuery({
		queryKey: ["enrollments", "detail", id],
		queryFn: () => result.data,
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<EnrollmentDetailView enrollmentId={id} permissions={permissions} />
		</HydrationBoundary>
	);
}
