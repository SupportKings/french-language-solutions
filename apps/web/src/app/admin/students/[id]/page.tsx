import { notFound } from "next/navigation";

import StudentDetailsClient from "./page-client";

async function getStudent(id: string) {
	const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3001";
	const response = await fetch(`${baseUrl}/api/students/${id}`, {
		cache: "no-store",
	});

	if (!response.ok) {
		return null;
	}

	return response.json();
}

export default async function StudentDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const student = await getStudent(id);

	if (!student) {
		notFound();
	}

	// Calculate student metrics (would come from actual data)
	const enrollmentCount = 1; // Would be calculated from actual enrollments
	const assessmentCount = 0; // Would be calculated from actual assessments

	return (
		<StudentDetailsClient
			student={student}
			enrollmentCount={enrollmentCount}
			assessmentCount={assessmentCount}
		/>
	);
}
