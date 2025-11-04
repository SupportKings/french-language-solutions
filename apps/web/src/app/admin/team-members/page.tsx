import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/rbac-middleware";

import { TeachersTable } from "@/features/teachers/components/TeachersTable";

import { getUser } from "@/queries/getUser";

export default async function TeamMembersPage() {
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// Only admins can view team members (teachers)
	await requirePermission("teachers", ["read"]);

	return <TeachersTable />;
}
