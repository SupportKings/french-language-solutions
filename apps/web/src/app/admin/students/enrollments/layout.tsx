import { redirect } from "next/navigation";

import { getUser } from "@/queries/getUser";

export default async function EnrollmentsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	let session;

	try {
		session = await getUser();
	} catch (error) {
		console.error("Failed to get user session in enrollments layout:", error);
		// Redirect to sign-in on auth failures
		redirect("/");
	}

	if (!session) {
		redirect("/");
	}

	// Only admins can access enrollments section
	if (session.user.role !== "admin") {
		redirect("/admin/students");
	}

	return <>{children}</>;
}
