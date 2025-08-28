import { AssessmentFormNew } from "@/features/assessments/components/AssessmentFormNew";

export default async function NewAssessmentPage({
	searchParams,
}: {
	searchParams: Promise<{ 
		studentId?: string;
		redirectTo?: string;
	}>;
}) {
	const params = await searchParams;
	return <AssessmentFormNew 
		studentId={params.studentId}
		redirectTo={params.redirectTo}
	/>;
}