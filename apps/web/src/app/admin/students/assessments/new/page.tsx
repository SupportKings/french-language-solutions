import { Card, CardContent } from "@/components/ui/card";
import { AssessmentForm } from "@/features/assessments/components/AssessmentForm";

export default function NewAssessmentPage({
	searchParams,
}: {
	searchParams: { studentId?: string };
}) {
	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Create Assessment</h1>
				<p className="text-muted-foreground">Schedule a new language assessment</p>
			</div>
			
			<Card>
				<CardContent className="pt-6">
					<AssessmentForm studentId={searchParams.studentId} />
				</CardContent>
			</Card>
		</div>
	);
}