import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const createMessageSchema = z.object({
	status: z.enum(["draft", "active", "scheduled"]).default("active"),
	time_delay_hours: z.number().int().positive().default(24),
	message_content: z.string().min(1, "Message content cannot be empty"),
});

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id: sequenceId } = await params;
		const body = await request.json();
		
		// Validate request body
		const validationResult = createMessageSchema.safeParse(body);
		if (!validationResult.success) {
			return NextResponse.json(
				{ error: validationResult.error.issues[0].message },
				{ status: 400 },
			);
		}
		
		const validatedData = validationResult.data;
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

		// Insert the new message with validated data
		const { data, error } = await supabase
			.from("template_follow_up_messages")
			.insert({
				sequence_id: sequenceId,
				step_index: nextStepIndex,
				status: validatedData.status,
				time_delay_hours: validatedData.time_delay_hours,
				message_content: validatedData.message_content,
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

		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		console.error("Message creation error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
