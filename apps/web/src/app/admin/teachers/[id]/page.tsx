import { notFound } from "next/navigation";
import TeacherDetailsClient from "./page-client";

async function getTeacher(id: string) {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
	const response = await fetch(`${baseUrl}/api/teachers/${id}`, {
		cache: "no-store",
	});

	if (!response.ok) {
		return null;
	}

	return response.json();
}

export default async function TeacherDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const teacher = await getTeacher(id);

	if (!teacher) {
		notFound();
	}

	return <TeacherDetailsClient teacher={teacher} />;
}