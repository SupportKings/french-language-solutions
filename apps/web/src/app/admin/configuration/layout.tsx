import { redirect } from "next/navigation";

import { getUser } from "@/queries/getUser";

export default async function ConfigurationLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// Only admins can access configuration
	if (session.user.role !== "admin") {
		redirect("/admin/students");
	}

	return <>{children}</>;
}
