import { notFound } from "next/navigation";

import TeacherDetailsClient from "./page-client";
import { getApiUrl } from "@/lib/api-utils";

async function getTeacher(id: string) {
	const response = await fetch(getApiUrl(`/api/teachers/${id}`), {
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
