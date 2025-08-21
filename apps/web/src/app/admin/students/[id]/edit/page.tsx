import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentForm } from "@/features/students/components/StudentForm";

async function getStudent(id: string) {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
	const response = await fetch(`${baseUrl}/api/students/${id}`, {
		cache: "no-store",
	});

	if (!response.ok) {
		return null;
	}

	return response.json();
}

export default async function EditStudentPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const student = await getStudent(id);

	if (!student) {
		notFound();
	}

	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Edit Student</h1>
				<p className="text-muted-foreground">Update student information</p>
			</div>
			
			<Card>
				<CardContent className="pt-6">
					<StudentForm student={student} />
				</CardContent>
			</Card>
		</div>
	);
}