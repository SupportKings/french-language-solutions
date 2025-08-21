import { Card, CardContent } from "@/components/ui/card";
import { EnrollmentForm } from "@/features/enrollments/components/EnrollmentForm";

export default function NewEnrollmentPage({
	searchParams,
}: {
	searchParams: { studentId?: string };
}) {
	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Create Enrollment</h1>
				<p className="text-muted-foreground">Add a new student enrollment to a cohort</p>
			</div>
			
			<Card>
				<CardContent className="pt-6">
					<EnrollmentForm studentId={searchParams.studentId} />
				</CardContent>
			</Card>
		</div>
	);
}