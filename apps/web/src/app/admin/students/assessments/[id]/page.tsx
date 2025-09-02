import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { getApiUrl } from "@/lib/api-utils";

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
		if (response.status === 404) {
			return null;
		}
		console.error(
			`Failed to fetch assessment ${id}: ${response.status} ${response.statusText}`,
		);
		throw new Error("Failed to fetch assessment");
	}

	return response.json();
}

export default async function AssessmentDetailsPage({ params }: PageProps) {
	const { id } = await params;
	const assessment = await getAssessment(id);

	if (!assessment) {
		notFound();
	}

	return <AssessmentDetailsClient assessment={assessment} />;
}
