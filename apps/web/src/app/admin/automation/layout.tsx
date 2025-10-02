import { redirect } from "next/navigation";

import { getUser } from "@/queries/getUser";

export default async function AutomationLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getUser();

	if (!session) {
		redirect("/sign-in");
	}

	// Only admins can access automation
	if (session.user.role !== "admin") {
		redirect("/admin/students");
	}

	return <>{children}</>;
}
