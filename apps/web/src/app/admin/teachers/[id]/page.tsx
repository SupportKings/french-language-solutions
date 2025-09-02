import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { getApiUrl } from "@/lib/api-utils";

import TeacherDetailsClient from "./page-client";

async function getTeacher(id: string) {
	const response = await fetch(getApiUrl(`/api/teachers/${id}`), {
		cache: "no-store",
		headers: { cookie: (await headers()).get("cookie") ?? "" },
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
