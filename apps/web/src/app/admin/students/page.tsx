import { redirect } from "next/navigation";

import { getUser } from "@/queries/getUser";
import { rolesMap } from "@/lib/permissions";

import { StudentsTable } from "@/features/students/components/StudentsTable";

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
