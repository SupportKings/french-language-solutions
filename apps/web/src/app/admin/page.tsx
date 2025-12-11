import { redirect } from "next/navigation";

import { getUser } from "@/queries/getUser";

export default async function AdminPage() {
	const session = await getUser();
	const userRole = session?.user.role || "";

	// Teachers should go to cohorts, others to students
	if (userRole === "teacher") {
		redirect("/admin/cohorts");
	}

	redirect("/admin/students");
}
