import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { EnrollmentDetailsClient } from "@/features/enrollments/components/EnrollmentDetailsClient";

interface EnrollmentPageProps {
	params: Promise<{ id: string }>;
}

export default async function EnrollmentDetailsPage({
	params,
}: EnrollmentPageProps) {
	const { id } = await params;
	const supabase = await createClient();

	// Fetch enrollment with all related data
	const { data: enrollment, error } = await supabase
		.from("enrollments")
		.select(`
			*,
			students(
				id,
				full_name,
				email,
				mobile_phone_number,
				city
			),
			cohorts(
				id,
				format,
				starting_level,
				start_date,
				cohort_status,
				current_level,
				room_type,
				product_id
			)
		`)
		.eq("id", id)
		.single();

	if (error) {
		console.error("Error fetching enrollment:", error);
		notFound();
	}

	if (!enrollment) {
		console.error("Enrollment not found for ID:", id);
		notFound();
	}

	return <EnrollmentDetailsClient enrollment={enrollment} />;
}
