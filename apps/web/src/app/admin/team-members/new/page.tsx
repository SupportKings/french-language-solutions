import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/rbac-middleware";
import { getUser } from "@/queries/getUser";

import { TeacherFormNew } from "@/features/teachers/components/TeacherFormNew";

export default async function NewTeamMemberPage() {
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// Only admins can create team members
	await requirePermission("teachers", ["write"]);

	return <TeacherFormNew />;
}
