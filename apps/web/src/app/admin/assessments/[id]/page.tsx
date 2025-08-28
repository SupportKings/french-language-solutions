import { QueryClient } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import AssessmentDetailsClient from "./page-client";

interface PageProps {
	params: Promise<{ id: string }>;
}

async function getAssessment(id: string) {
	// For server-side fetching in Next.js App Router, we need to construct the full URL
	const baseUrl = `https://${process.env.NEXT_PUBLIC_APP_URL}`;
	
	const response = await fetch(
		`${baseUrl}/api/assessments/${id}`,
		{
			cache: "no-store",
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);

	if (!response.ok) {
		if (response.status === 404) {
			return null;
		}
		console.error(`Failed to fetch assessment ${id}: ${response.status} ${response.statusText}`);
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