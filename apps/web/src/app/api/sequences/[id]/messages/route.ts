import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id: sequenceId } = await params;
		const body = await request.json();
		const supabase = await createClient();

		// Get the current max step_index for this sequence
		const { data: existingMessages } = await supabase
			.from("template_follow_up_messages")
			.select("step_index")
			.eq("sequence_id", sequenceId)
			.order("step_index", { ascending: false })
			.limit(1);

		const nextStepIndex =
			existingMessages && existingMessages.length > 0
				? existingMessages[0].step_index + 1
				: 0;

		// Insert the new message
		const { data, error } = await supabase
			.from("template_follow_up_messages")
			.insert({
				sequence_id: sequenceId,
				step_index: nextStepIndex,
				status: body.status || "active",
				time_delay_hours: body.time_delay_hours || 24,
				message_content: body.message_content,
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating message:", error);
			return NextResponse.json(
				{ error: "Failed to create message" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Message creation error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
