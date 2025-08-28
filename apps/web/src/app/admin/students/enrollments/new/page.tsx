import { EnrollmentFormNew } from "@/features/enrollments/components/EnrollmentFormNew";

export default async function NewEnrollmentPage({
	searchParams,
}: {
	searchParams: Promise<{
		studentId?: string;
		cohortId?: string;
		cohortName?: string;
		redirectTo?: string;
	}>;
}) {
	const params = await searchParams;
	return (
		<EnrollmentFormNew
			studentId={params.studentId}
			cohortId={params.cohortId}
			cohortName={params.cohortName}
			redirectTo={params.redirectTo}
		/>
	);
}
