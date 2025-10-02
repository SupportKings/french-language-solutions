import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { id: studentId } = await params;
		const supabase = await createClient();

		// Fetch follow-ups for the student with sequence information
		const { data: followUps, error } = await supabase
			.from("automated_follow_ups")
			.select(`
				id,
				student_id,
				status,
				started_at,
				last_message_sent_at,
				completed_at,
				created_at,
				updated_at,
				template_follow_up_sequences(
					id,
					display_name,
					subject
				)
			`)
			.eq("student_id", studentId)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching follow-ups:", error);
			return NextResponse.json(
				{ error: "Failed to fetch follow-ups" },
				{ status: 500 },
			);
		}

		// Transform the data to match component expectations
		const transformedFollowUps = (followUps || []).map((followUp) => ({
			id: followUp.id,
			student_id: followUp.student_id,
			sequence_id: (followUp.template_follow_up_sequences as any)?.id,
			status: followUp.status, // Keep original status
			started_at: followUp.started_at,
			last_message_sent_at: followUp.last_message_sent_at,
			completed_at: followUp.completed_at,
			created_at: followUp.created_at,
			updated_at: followUp.updated_at,
			sequence: {
				id: (followUp.template_follow_up_sequences as any)?.id || "",
				display_name:
					(followUp.template_follow_up_sequences as any)?.display_name ||
					"Follow-up Sequence",
				subject: (followUp.template_follow_up_sequences as any)?.subject || "",
			},
		}));

		return NextResponse.json(transformedFollowUps);
	} catch (error) {
		console.error("Error in GET /api/students/[id]/followups:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
