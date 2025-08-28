import { notFound } from "next/navigation";

import { StudentFormNew } from "@/features/students/components/StudentFormNew";

async function getStudent(id: string) {
	const baseUrl = process.env.VERCEL_URL || "http://localhost:3001";
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

	return <StudentFormNew student={student} />;
}
