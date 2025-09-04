import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string; messageId: string }> },
) {
	try {
		const { messageId } = await params;
		const body = await request.json();
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("template_follow_up_messages")
			.update({
				status: body.status,
				time_delay_hours: body.time_delay_hours,
				message_content: body.message_content,
			})
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
	request: NextRequest,
	{ params }: { params: Promise<{ id: string; messageId: string }> },
) {
	try {
		const { id: sequenceId, messageId } = await params;
		const supabase = await createClient();

		// Get the step_index of the message being deleted
		const { data: messageToDelete } = await supabase
			.from("template_follow_up_messages")
			.select("step_index")
			.eq("id", messageId)
			.single();

		if (!messageToDelete) {
			return NextResponse.json({ error: "Message not found" }, { status: 404 });
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

		// Get all messages that come after the deleted one
		const { data: messagesToUpdate } = await supabase
			.from("template_follow_up_messages")
			.select("id, step_index")
			.eq("sequence_id", sequenceId)
			.gt("step_index", messageToDelete.step_index)
			.order("step_index", { ascending: true });

		// Update step_index for messages that come after the deleted one
		if (messagesToUpdate && messagesToUpdate.length > 0) {
			for (const message of messagesToUpdate) {
				const { error: updateError } = await supabase
					.from("template_follow_up_messages")
					.update({ step_index: message.step_index - 1 })
					.eq("id", message.id);

				if (updateError) {
					console.error("Error updating step index for message:", message.id, updateError);
					// The message is already deleted, so we just log the error
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
