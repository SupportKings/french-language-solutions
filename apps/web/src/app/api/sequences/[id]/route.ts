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
			.order("step_index", {
				foreignTable: "template_follow_up_messages",
				ascending: true,
			})
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

		// Get count of active follow-ups (activated or ongoing)
		const { count: activeCount } = await supabase
			.from("automated_follow_ups")
			.select("*", { count: "exact", head: true })
			.eq("sequence_id", id)
			.in("status", ["activated", "ongoing"]);

		// Add the count to the response
		const responseData = {
			...data,
			_count: {
				automated_follow_ups: activeCount || 0,
			},
		};

		return NextResponse.json(responseData);
	} catch (error) {
		console.error("Sequence detail error:", error);
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
		const body = await request.json();
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("template_follow_up_sequences")
			.update({
				...body,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
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
			.order("step_index", {
				foreignTable: "template_follow_up_messages",
				ascending: true,
			})
			.single();

		if (error) {
			console.error("Error updating sequence:", error);
			return NextResponse.json(
				{ error: "Failed to update sequence" },
				{ status: 500 },
			);
		}

		// Get count of active follow-ups (activated or ongoing)
		const { count: activeCount } = await supabase
			.from("automated_follow_ups")
			.select("*", { count: "exact", head: true })
			.eq("sequence_id", id)
			.in("status", ["activated", "ongoing"]);

		// Add the count to the response
		const responseData = {
			...data,
			_count: {
				automated_follow_ups: activeCount || 0,
			},
		};

		return NextResponse.json(responseData);
	} catch (error) {
		console.error("Sequence update error:", error);
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
