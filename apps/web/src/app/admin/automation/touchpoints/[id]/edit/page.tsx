import { redirect } from "next/navigation";

export default async function TouchpointEditPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	// Redirect to details page since we have inline editing there
	redirect(`/admin/automation/touchpoints/${id}`);
}
