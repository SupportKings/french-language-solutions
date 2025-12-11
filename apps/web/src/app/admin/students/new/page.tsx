import { redirect } from "next/navigation";

import { StudentFormNew } from "@/features/students/components/StudentFormNew";

import { getUser } from "@/queries/getUser";

export default async function NewStudentPage() {
	const session = await getUser();

	if (!session) {
		redirect("/signin");
	}

	// Teachers cannot create new students
	if (session.user.role === "teacher") {
		redirect("/admin/cohorts");
	}

	return <StudentFormNew />;
}
