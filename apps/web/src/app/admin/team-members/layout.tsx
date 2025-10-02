import { redirect } from "next/navigation";

import { getUser } from "@/queries/getUser";

export default async function TeamMembersLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getUser();

	if (!session) {
		redirect("/sign-in");
	}

	// Only admins can access team members
	if (session.user.role !== "admin") {
		redirect("/admin/students");
	}

	return <>{children}</>;
}
