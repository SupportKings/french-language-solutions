import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getApiUrl } from "@/lib/api-utils";
import { getUser } from "@/queries/getUser";
import { rolesMap } from "@/lib/permissions";
import { AccessDenied } from "@/components/ui/access-denied";

import AssessmentDetailsClient from "./page-client";

interface PageProps {
	params: Promise<{ id: string }>;
}

async function getAssessment(id: string) {
	// For server-side fetching in Next.js App Router, we need to construct the full URL
	const response = await fetch(getApiUrl(`/api/assessments/${id}`), {
		cache: "no-store",
		headers: {
			"Content-Type": "application/json",
			cookie: (await headers()).get("cookie") ?? "",
		},
	});

	if (!response.ok) {
		// Return both data and status
		return { data: null, status: response.status };
	}

	const data = await response.json();
	return { data, status: 200 };
}

export default async function AssessmentDetailsPage({ params }: PageProps) {
	const { id } = await params;
	const session = await getUser();

	if (!session) {
		redirect("/signin");
	}

	// Get user's role and permissions
	const userRole = session.user.role || "teacher";
	const rolePermissions = rolesMap[userRole as keyof typeof rolesMap];
	const permissions = rolePermissions?.statements || {};

	const result = await getAssessment(id);

	// Handle different error cases
	if (!result.data) {
		if (result.status === 403) {
			return (
				<AccessDenied
					message="You don't have permission to view this assessment."
					backLink="/admin/students/assessments"
					backLinkText="Back to Assessments List"
				/>
			);
		}
		notFound();
	}

	return <AssessmentDetailsClient assessment={result.data} permissions={permissions} />;
}
