import { AutomatedFollowUpForm } from "@/features/automated-follow-ups/components/AutomatedFollowUpForm";

export default async function NewAutomatedFollowUpPage({
	searchParams,
}: {
	searchParams: Promise<{ 
		studentId?: string;
		studentName?: string;
		email?: string;
		phone?: string;
	}>;
}) {
	const params = await searchParams;
	return <AutomatedFollowUpForm searchParams={params} />;
}