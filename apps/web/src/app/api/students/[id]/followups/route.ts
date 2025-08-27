import { NextRequest, NextResponse } from "next/server";
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
					subject,
					first_follow_up_delay_minutes
				)
			`)
			.eq("student_id", studentId)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching follow-ups:", error);
			return NextResponse.json(
				{ error: "Failed to fetch follow-ups" },
				{ status: 500 }
			);
		}

		// Transform the data to match component expectations
		const transformedFollowUps = (followUps || []).map(followUp => ({
			id: followUp.id,
			student_id: followUp.student_id,
			title: (followUp.template_follow_up_sequences as any)?.display_name || "Follow-up Sequence",
			description: (followUp.template_follow_up_sequences as any)?.subject || "",
			follow_up_date: followUp.started_at,
			status: followUp.status === "activated" ? "pending" : 
					followUp.status === "answer_received" ? "completed" : 
					followUp.status === "disabled" ? "cancelled" : "pending",
			priority: "medium", // Default priority since not in schema
			created_at: followUp.created_at,
			updated_at: followUp.updated_at,
			created_by: undefined, // No teacher relation in this schema
		}));

		return NextResponse.json(transformedFollowUps);
	} catch (error) {
		console.error("Error in GET /api/students/[id]/followups:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}