import { FollowUpForm } from "@/features/follow-ups/components/FollowUpForm";

export default async function NewAutomatedFollowUpPage({
	searchParams,
}: {
	searchParams: Promise<{
		studentId?: string;
		sequenceId?: string;
		redirectTo?: string;
	}>;
}) {
	const params = await searchParams;
	return (
		<FollowUpForm
			studentId={params.studentId}
			sequenceId={params.sequenceId}
			redirectTo={params.redirectTo}
		/>
	);
}
