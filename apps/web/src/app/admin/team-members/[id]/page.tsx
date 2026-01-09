import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { getApiUrl } from "@/lib/api-utils";

import { getTeacherUser } from "@/features/teachers/actions/getTeacherUser";

import { getUser } from "@/queries/getUser";

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

export default async function TeamMemberDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const teacher = await getTeacher(id);

	if (!teacher) {
		notFound();
	}

	// Fetch user details if teacher has a user_id
	let userDetails = null;
	if (teacher.user_id) {
		userDetails = await getTeacherUser(teacher.user_id);
	}

	// Merge user details into teacher object
	const teacherWithUser = {
		...teacher,
		userDetails,
	};

	// Get current user session to check permissions
	const session = await getUser();
	const canAccessProducts =
		session?.user?.role === "admin" || session?.user?.role === "super_admin";

	return (
		<TeacherDetailsClient
			teacher={teacherWithUser}
			canAccessProducts={canAccessProducts}
		/>
	);
}
