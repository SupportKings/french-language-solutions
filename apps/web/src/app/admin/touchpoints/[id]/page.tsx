import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TouchpointDetailsClient } from "@/features/touchpoints/components/TouchpointDetailsClient";

interface TouchpointPageProps {
	params: Promise<{ id: string }>;
}

export default async function TouchpointDetailsPage({ params }: TouchpointPageProps) {
	const { id } = await params;
	const supabase = await createClient();

	// Fetch touchpoint with all related data
	const { data: touchpoint, error } = await supabase
		.from("touchpoints")
		.select(`
			*,
			students(
				id,
				full_name,
				email,
				mobile_phone_number,
				desired_language_level:language_levels!desired_starting_language_level_id (
					id,
					code,
					display_name,
					level_group
				)
			),
			automated_follow_up:automated_follow_ups!automated_follow_up_id (
				id,
				status,
				sequences:template_follow_up_sequences!sequence_id (
					id,
					display_name,
					subject
				)
			)
		`)
		.eq("id", id)
		.single();

	if (error || !touchpoint) {
		notFound();
	}

	// Transform the data to match expected format
	const transformedTouchpoint = {
		...touchpoint,
		student: touchpoint.students,
		automated_follow_up: touchpoint.automated_follow_up ? {
			...touchpoint.automated_follow_up,
			sequence_name: touchpoint.automated_follow_up.sequences?.display_name || 'Unknown Sequence'
		} : null
	};

	return <TouchpointDetailsClient touchpoint={transformedTouchpoint} />;
}

