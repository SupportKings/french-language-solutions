import { redirect } from "next/navigation";

import { getUser } from "@/queries/getUser";

export default async function StudentsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getUser();
	const userRole = session?.user.role || "";

	// Teachers cannot access the students section
	if (userRole === "teacher") {
		redirect("/admin/cohorts");
	}

	return <>{children}</>;
}
