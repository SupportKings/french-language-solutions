import { redirect } from "next/navigation";

import { RescheduleRequestsTable } from "@/features/reschedule-requests/components/RescheduleRequestsTable";

import { getUser } from "@/queries/getUser";

export default async function RescheduleRequestsPage() {
	const session = await getUser();

	if (!session) {
		redirect("/signin");
	}

	return <RescheduleRequestsTable />;
}
