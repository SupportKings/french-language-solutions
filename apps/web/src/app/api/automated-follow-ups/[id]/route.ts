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
			.from("automated_follow_ups")
			.select(`
				*,
				students (
					id,
					full_name,
					email,
					mobile_phone_number,
					desired_language_level:language_levels!desired_starting_language_level_id (
						id,
						code,
						display_name,
						level_group
					)
				),
				sequences:template_follow_up_sequences!sequence_id (
					id,
					display_name,
					subject,
					first_follow_up_delay_minutes
				),
				touchpoints (
					id,
					message,
					channel,
					type,
					occurred_at
				)
			`)
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching follow-up:", error);
			return NextResponse.json(
				{ error: "Failed to fetch follow-up" },
				{ status: 500 },
			);
		}

		if (!data) {
			return NextResponse.json(
				{ error: "Follow-up not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Follow-up detail error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const supabase = await createClient();
		const body = await request.json();

		const { data, error } = await supabase
			.from("automated_follow_ups")
			.update({
				...body,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("Error updating follow-up:", error);
			return NextResponse.json(
				{ error: "Failed to update follow-up" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Follow-up update error:", error);
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

		const { error } = await supabase
			.from("automated_follow_ups")
			.delete()
			.eq("id", id);

		if (error) {
			console.error("Error deleting follow-up:", error);
			return NextResponse.json(
				{ error: "Failed to delete follow-up" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Follow-up deletion error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
