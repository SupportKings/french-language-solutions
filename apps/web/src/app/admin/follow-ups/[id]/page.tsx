import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FollowUpDetailsClient } from "@/features/follow-ups/components/FollowUpDetailsClient";

interface FollowUpPageProps {
	params: Promise<{ id: string }>;
}

export default async function FollowUpDetailsPage({ params }: FollowUpPageProps) {
	const { id } = await params;
	const supabase = await createClient();

	// Fetch follow-up with all related data
	const { data: followUp, error } = await supabase
		.from("automated_follow_ups")
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
					level_group,
					level_number
				)
			),
			sequences:template_follow_up_sequences!sequence_id (
				id,
				display_name,
				subject,
				first_follow_up_delay_minutes
			),
			touchpoints(
				id,
				message,
				channel,
				type,
				occurred_at
			)
		`)
		.eq("id", id)
		.single();

	if (error || !followUp) {
		notFound();
	}

	// Transform the data to match expected format
	const transformedFollowUp = {
		...followUp,
		student: followUp.students,
		sequence: {
			...followUp.sequences,
			// Calculate message counts from touchpoints
			total_messages: followUp.touchpoints?.length || 0,
			messages_sent: followUp.touchpoints?.length || 0
		},
		touchpoints: followUp.touchpoints || []
	};

	return <FollowUpDetailsClient followUp={transformedFollowUp} />;
}

