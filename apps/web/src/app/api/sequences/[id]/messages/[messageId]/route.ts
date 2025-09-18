import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { z } from "zod";

const updateMessageSchema = z.object({
	status: z.enum(["active", "disabled"]).optional(),
	time_delay_hours: z.number().min(0).optional(),
	message_content: z.string().optional(),
});

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string; messageId: string }> },
) {
	try {
		const { messageId } = await params;
		const body = await request.json();

		// Validate request body
		const validationResult = updateMessageSchema.safeParse(body);
		if (!validationResult.success) {
			return NextResponse.json(
				{ error: validationResult.error.issues[0].message },
				{ status: 400 },
			);
		}

		// Build update payload from validated data only
		const updatePayload: Record<string, any> = {};
		const validatedData = validationResult.data;

		if (validatedData.status !== undefined) {
			updatePayload.status = validatedData.status;
		}
		if (validatedData.time_delay_hours !== undefined) {
			updatePayload.time_delay_hours = validatedData.time_delay_hours;
		}
		if (validatedData.message_content !== undefined) {
			updatePayload.message_content = validatedData.message_content;
		}

		const supabase = await createClient();

		const { data, error } = await supabase
			.from("template_follow_up_messages")
			.update(updatePayload)
			.eq("id", messageId)
			.select()
			.single();

		if (error) {
			console.error("Error updating message:", error);
			return NextResponse.json(
				{ error: "Failed to update message" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Message update error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string; messageId: string }> },
) {
	try {
		const { id: sequenceId, messageId } = await params;
		const supabase = await createClient();

		// First, get the message to be deleted to know its step_index
		const { data: messageToDelete, error: fetchError } = await supabase
			.from("template_follow_up_messages")
			.select("step_index, sequence_id")
			.eq("id", messageId)
			.single();

		if (fetchError || !messageToDelete) {
			return NextResponse.json(
				{ error: "Message not found" },
				{ status: 404 },
			);
		}

		// Delete the message
		const { error: deleteError } = await supabase
			.from("template_follow_up_messages")
			.delete()
			.eq("id", messageId);

		if (deleteError) {
			console.error("Error deleting message:", deleteError);
			return NextResponse.json(
				{ error: "Failed to delete message" },
				{ status: 500 },
			);
		}

		// Get all messages that need reordering (those with step_index greater than deleted message)
		const { data: messagesToReorder, error: fetchReorderError } = await supabase
			.from("template_follow_up_messages")
			.select("id, step_index")
			.eq("sequence_id", messageToDelete.sequence_id)
			.gt("step_index", messageToDelete.step_index)
			.order("step_index");

		if (fetchReorderError) {
			console.error("Error fetching messages to reorder:", fetchReorderError);
			// Message is already deleted, return success anyway
			return NextResponse.json({ success: true });
		}

		// Update each message's step_index
		if (messagesToReorder && messagesToReorder.length > 0) {
			for (const message of messagesToReorder) {
				const { error: updateError } = await supabase
					.from("template_follow_up_messages")
					.update({ step_index: message.step_index - 1 })
					.eq("id", message.id);

				if (updateError) {
					console.error(`Error updating message ${message.id}:`, updateError);
					// Continue with other messages even if one fails
				}
			}
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Message deletion error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
