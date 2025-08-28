import { notFound } from "next/navigation";

import { EnrollmentFormNew } from "@/features/enrollments/components/EnrollmentFormNew";

async function getEnrollment(id: string) {
	const baseUrl = process.env.VERCEL_URL || "http://localhost:3001";
	const response = await fetch(`${baseUrl}/api/enrollments/${id}`, {
		cache: "no-store",
	});

	if (!response.ok) {
		return null;
	}

	return response.json();
}

export default async function EditEnrollmentPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ redirectTo?: string }>;
}) {
	const { id } = await params;
	const { redirectTo } = await searchParams;
	const enrollment = await getEnrollment(id);

	if (!enrollment) {
		notFound();
	}

	return <EnrollmentFormNew enrollment={enrollment} redirectTo={redirectTo} />;
}
