import { redirect } from "next/navigation";

import { getUser } from "@/queries/getUser";

export default async function AutomationLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// Only admins and super_admins can access automation
	if (session.user.role !== "admin" && session.user.role !== "super_admin") {
		redirect("/admin/students");
	}

	return <>{children}</>;
}
