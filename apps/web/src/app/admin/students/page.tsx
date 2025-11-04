import { redirect } from "next/navigation";

import { rolesMap } from "@/lib/permissions";

import { StudentsTable } from "@/features/students/components/StudentsTable";

import { getUser } from "@/queries/getUser";

export default async function StudentsPage() {
	const session = await getUser();

	if (!session) {
		redirect("/signin");
	}

	// Get user's role and permissions
	const userRole = session.user.role || "teacher";
	const rolePermissions = rolesMap[userRole as keyof typeof rolesMap];
	const permissions = rolePermissions?.statements || {};

	return <StudentsTable permissions={permissions} />;
}
