import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { EnrollmentForm } from "@/features/enrollments/components/EnrollmentForm";

async function getEnrollment(id: string) {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
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
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const enrollment = await getEnrollment(id);

	if (!enrollment) {
		notFound();
	}

	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Edit Enrollment</h1>
				<p className="text-muted-foreground">Update enrollment information</p>
			</div>
			
			<Card>
				<CardContent className="pt-6">
					<EnrollmentForm enrollment={enrollment} />
				</CardContent>
			</Card>
		</div>
	);
}