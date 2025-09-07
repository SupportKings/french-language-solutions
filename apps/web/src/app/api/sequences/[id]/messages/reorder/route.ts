import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id: sequenceId } = await params;
		const { messageId, newIndex } = await request.json();
		const supabase = await createClient();

		// Get all messages for this sequence ordered by step_index
		const { data: messages, error: fetchError } = await supabase
			.from("template_follow_up_messages")
			.select("id, step_index")
			.eq("sequence_id", sequenceId)
			.order("step_index", { ascending: true });

		if (fetchError || !messages) {
			console.error("Error fetching messages:", fetchError);
			return NextResponse.json(
				{ error: "Failed to fetch messages" },
				{ status: 500 },
			);
		}

		// Find the current index of the message to move
		const currentIndex = messages.findIndex((m) => m.id === messageId);
		if (currentIndex === -1) {
			return NextResponse.json({ error: "Message not found" }, { status: 404 });
		}

		// Validate newIndex
		if (newIndex < 0 || newIndex >= messages.length) {
			return NextResponse.json({ error: "Invalid new index" }, { status: 400 });
		}

		// If no movement needed, return success
		if (currentIndex === newIndex) {
			return NextResponse.json({ success: true });
		}

		// Create a new array with the reordered messages
		const reorderedMessages = [...messages];
		const [movedMessage] = reorderedMessages.splice(currentIndex, 1);
		reorderedMessages.splice(newIndex, 0, movedMessage);

		// Update step_index for all affected messages
		const updates = reorderedMessages.map((message, index) => ({
			id: message.id,
			step_index: index,
		}));

		// Perform batch upsert in a single atomic operation
		const { error: updateError } = await supabase
			.from("template_follow_up_messages")
			.upsert(updates, { onConflict: "id" })
			.select();

		if (updateError) {
			console.error("Error updating message step_index:", updateError);
			return NextResponse.json(
				{ error: "Failed to reorder messages" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Message reordering error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
