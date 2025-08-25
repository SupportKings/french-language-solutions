import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AssessmentDetailsClient } from "@/features/assessments/components/AssessmentDetailsClient";

interface AssessmentPageProps {
	params: Promise<{ id: string }>;
}

export default async function AssessmentDetailsPage({ params }: AssessmentPageProps) {
	const { id } = await params;
	const supabase = await createClient();

	// Fetch assessment with all related data
	const { data: assessment, error } = await supabase
		.from("student_assessments")
		.select(`
			*,
			students(
				id,
				full_name,
				email,
				mobile_phone_number,
				city
			),
			interview_held_by:teachers!interview_held_by(
				id,
				first_name,
				last_name,
				email
			),
			level_checked_by:teachers!level_checked_by(
				id,
				first_name,
				last_name,
				email
			)
		`)
		.eq("id", id)
		.single();

	if (error || !assessment) {
		notFound();
	}

	return <AssessmentDetailsClient assessment={assessment} />;
}