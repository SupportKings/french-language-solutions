import { notFound } from "next/navigation";

import { StudentFormNew } from "@/features/students/components/StudentFormNew";
import { getApiUrl } from "@/lib/api-utils";

async function getStudent(id: string) {
	const response = await fetch(getApiUrl(`/api/students/${id}`), {
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
