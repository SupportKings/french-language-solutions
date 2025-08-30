import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";

import { AssessmentForm } from "@/features/assessments/components/AssessmentForm";

async function getAssessment(id: string) {
	const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3001";
	const response = await fetch(`${baseUrl}/api/assessments/${id}`, {
		cache: "no-store",
	});

	if (!response.ok) {
		return null;
	}

	return response.json();
}

export default async function EditAssessmentPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const assessment = await getAssessment(id);

	if (!assessment) {
		notFound();
	}

	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="font-bold text-2xl">Edit Assessment</h1>
				<p className="text-muted-foreground">Update assessment information</p>
			</div>

			<Card>
				<CardContent className="pt-6">
					<AssessmentForm assessment={assessment} />
				</CardContent>
			</Card>
		</div>
	);
}
