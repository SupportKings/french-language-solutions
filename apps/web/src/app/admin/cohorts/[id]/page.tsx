import { notFound, redirect } from "next/navigation";

import { cohortsApi } from "@/features/cohorts/api/cohorts.api";
import { cohortsQueries } from "@/features/cohorts/queries/cohorts.queries";

import { getUser } from "@/queries/getUser";
import { rolesMap } from "@/lib/permissions";
import { AccessDenied } from "@/components/ui/access-denied";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { CohortDetailPageClient } from "./page-client";

export default async function CohortDetailPage({
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

	// Prefetch cohort data
	try {
		await Promise.all([
			queryClient.prefetchQuery(cohortsQueries.detail(id)),
			queryClient.prefetchQuery(cohortsQueries.withSessions(id)),
		]);
	} catch (error: any) {
		// Check if it's a 403 Forbidden error
		if (error?.status === 403) {
			return (
				<AccessDenied
					message="You don't have permission to view this cohort. You can only access cohorts where you are assigned as a teacher."
					backLink="/admin/cohorts"
					backLinkText="Back to Cohorts List"
				/>
			);
		}
		// For other errors (404, 500, etc.), show default 404
		notFound();
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<CohortDetailPageClient cohortId={id} permissions={permissions} />
		</HydrationBoundary>
	);
}
