import { redirect } from "next/navigation";

import { rolesMap } from "@/lib/permissions";

import { AssessmentsTable } from "@/features/assessments/components/AssessmentsTable";

import { getUser } from "@/queries/getUser";

export default async function AssessmentsPage() {
	const session = await getUser();

	if (!session) {
		redirect("/signin");
	}

	// Get user's role and permissions
	const userRole = session.user.role || "teacher";
	const rolePermissions = rolesMap[userRole as keyof typeof rolesMap];
	const permissions = rolePermissions?.statements || {};

	return <AssessmentsTable permissions={permissions} />;
}
