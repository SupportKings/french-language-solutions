import { redirect } from "next/navigation";

import { rolesMap } from "@/lib/permissions";

import { StudentsTable } from "@/features/students/components/StudentsTable";

import { getUser } from "@/queries/getUser";

export default async function StudentsPage() {
	const session = await getUser();

	if (!session) {
		redirect("/signin");
	}

	// Teachers cannot access the students list page
	// (they can only access individual student detail pages via cohort links)
	if (session.user.role === "teacher") {
		redirect("/admin/cohorts");
	}

	// Get user's role and permissions
	const userRole = session.user.role || "teacher";
	const rolePermissions = rolesMap[userRole as keyof typeof rolesMap];
	const permissions = rolePermissions?.statements || {};

	return <StudentsTable permissions={permissions} />;
}
