import { QueryClient } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import AssessmentDetailsClient from "./page-client";

interface PageProps {
	params: Promise<{ id: string }>;
}

async function getAssessment(id: string) {
	// For server-side fetching in Next.js App Router, we need to construct the full URL
	// Using localhost for internal API calls
	const baseUrl = process.env.NODE_ENV === 'production' 
		? `https://${process.env.VERCEL_URL || 'localhost:3001'}`
		: 'http://localhost:3001';
	
	const response = await fetch(
		`${baseUrl}/api/assessments/${id}`,
		{
			cache: "no-store",
		}
	);

	if (!response.ok) {
		if (response.status === 404) {
			return null;
		}
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