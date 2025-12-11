import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ReschedulingPageClient } from "@/features/rescheduling/components/ReschedulingPageClient";
import {
	getPrivateEnrollment,
	getRescheduleRequests,
} from "@/features/rescheduling/queries";

import { getUser } from "@/queries/getUser";

export default async function ReschedulingPage() {
	const session = await getUser();

	if (!session?.user) {
		redirect("/");
	}

	// Get student ID
	const supabase = await createClient();
	const { data: student } = await supabase
		.from("students")
		.select("id")
		.eq("user_id", session.user.id)
		.single();

	if (!student) {
		redirect("/?error=not_a_student");
	}

	// Fetch private enrollment and reschedule requests
	const [privateEnrollment, rescheduleRequests] = await Promise.all([
		getPrivateEnrollment(student.id),
		getRescheduleRequests(student.id),
	]);

	// Redirect if no private enrollment
	if (!privateEnrollment) {
		redirect("/dashboard");
	}

	return (
		<ReschedulingPageClient
			enrollment={privateEnrollment}
			requests={rescheduleRequests}
		/>
	);
}
