import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("template_follow_up_sequences")
			.select(`
				*,
				template_follow_up_messages (
					id,
					step_index,
					status,
					time_delay_hours,
					message_content,
					created_at,
					updated_at
				)
			`)
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching sequence:", error);
			return NextResponse.json(
				{ error: "Failed to fetch sequence" },
				{ status: 500 },
			);
		}

		if (!data) {
			return NextResponse.json(
				{ error: "Sequence not found" },
				{ status: 404 },
			);
		}

		// Sort messages by step_index
		if (data.template_follow_up_messages) {
			data.template_follow_up_messages.sort(
				(a: any, b: any) => a.step_index - b.step_index,
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Sequence detail error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const supabase = await createClient();

		// First delete all messages associated with this sequence
		await supabase
			.from("template_follow_up_messages")
			.delete()
			.eq("sequence_id", id);

		// Then delete the sequence itself
		const { error } = await supabase
			.from("template_follow_up_sequences")
			.delete()
			.eq("id", id);

		if (error) {
			console.error("Error deleting sequence:", error);
			return NextResponse.json(
				{ error: "Failed to delete sequence" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Sequence deletion error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
