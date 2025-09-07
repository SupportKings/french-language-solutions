import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const updateMessageSchema = z.object({
	status: z.enum(["draft", "active", "scheduled"]).optional(),
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
		const { messageId } = await params;
		const supabase = await createClient();

		// Use atomic RPC function to delete message and reorder indices
		const { error: rpcError } = await supabase.rpc("delete_message_and_reorder", {
			p_message_id: messageId,
		});

		if (rpcError) {
			// Check if message not found
			if (rpcError.message?.includes("Message not found")) {
				return NextResponse.json({ error: "Message not found" }, { status: 404 });
			}
			
			console.error("Error deleting message:", rpcError);
			return NextResponse.json(
				{ error: "Failed to delete message" },
				{ status: 500 },
			);
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
