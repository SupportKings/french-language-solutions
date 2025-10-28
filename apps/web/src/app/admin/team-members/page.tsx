import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/rbac-middleware";
import { getUser } from "@/queries/getUser";

import { TeachersTable } from "@/features/teachers/components/TeachersTable";

export default async function TeamMembersPage() {
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// Only admins can view team members (teachers)
	await requirePermission("teachers", ["read"]);

	return <TeachersTable />;
}
