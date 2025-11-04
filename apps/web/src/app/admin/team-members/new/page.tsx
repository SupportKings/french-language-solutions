import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/rbac-middleware";

import { TeacherFormNew } from "@/features/teachers/components/TeacherFormNew";

import { getUser } from "@/queries/getUser";

export default async function NewTeamMemberPage() {
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// Only admins can create team members
	await requirePermission("teachers", ["write"]);

	return <TeacherFormNew />;
}
