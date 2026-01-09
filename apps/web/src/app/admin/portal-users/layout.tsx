import { redirect } from "next/navigation";

import { getUser } from "@/queries/getUser";

export default async function PortalUsersLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// Only admins and super_admins can access portal users
	if (session.user.role !== "admin" && session.user.role !== "super_admin") {
		redirect("/admin/students");
	}

	return <>{children}</>;
}
