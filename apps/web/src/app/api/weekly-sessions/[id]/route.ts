import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// GET /api/weekly-sessions/[id] - Get a single weekly session
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("weekly_sessions")
			.select(`
				*,
				teachers(
					id,
					first_name,
					last_name,
					mobile_phone_number,
					available_for_online_classes,
					available_for_in_person_classes
				)
			`)
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching weekly session:", error);
			return NextResponse.json(
				{ error: "Failed to fetch weekly session" },
				{ status: 500 },
			);
		}

		if (!data) {
			return NextResponse.json(
				{ error: "Weekly session not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in weekly session GET:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// PATCH /api/weekly-sessions/[id] - Update a weekly session
export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const body = await request.json();
		const supabase = await createClient();

		// Remove fields that shouldn't be updated
		const { id: _, created_at, updated_at, ...updateData } = body;

		const { data, error } = await supabase
			.from("weekly_sessions")
			.update(updateData)
			.eq("id", id)
			.select(`
				*,
				teachers(
					id,
					first_name,
					last_name,
					mobile_phone_number,
					available_for_online_classes,
					available_for_in_person_classes
				)
			`)
			.single();

		if (error) {
			console.error("Error updating weekly session:", error);
			return NextResponse.json(
				{ error: "Failed to update weekly session" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in weekly session PATCH:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// DELETE /api/weekly-sessions/[id] - Delete a weekly session
export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const supabase = await createClient();

		const { error } = await supabase
			.from("weekly_sessions")
			.delete()
			.eq("id", id);

		if (error) {
			console.error("Error deleting weekly session:", error);
			return NextResponse.json(
				{ error: "Failed to delete weekly session" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error in weekly session DELETE:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
