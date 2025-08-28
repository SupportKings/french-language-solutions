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
			.from("touchpoints")
			.select(`
				*,
				students (
					id,
					full_name,
					email,
					mobile_phone_number
				),
				automated_follow_ups (
					id,
					status,
					sequences:template_follow_up_sequences!sequence_id (
						display_name
					)
				)
			`)
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching touchpoint:", error);
			return NextResponse.json(
				{ error: "Failed to fetch touchpoint" },
				{ status: 500 },
			);
		}

		if (!data) {
			return NextResponse.json(
				{ error: "Touchpoint not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Touchpoint detail error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const supabase = await createClient();
		const body = await request.json();

		const { data, error } = await supabase
			.from("touchpoints")
			.update({
				channel: body.channel,
				type: body.type,
				message: body.message,
				source: body.source,
				automated_follow_up_id: body.automated_follow_up_id,
				external_id: body.external_id,
				external_metadata: body.external_metadata,
				occurred_at: body.occurred_at,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("Error updating touchpoint:", error);
			return NextResponse.json(
				{ error: "Failed to update touchpoint" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Touchpoint update error:", error);
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

		// For PATCH, we only update the fields that are provided
		const updateData = {
			...body,
			updated_at: new Date().toISOString(),
		};

		const { data, error } = await supabase
			.from("touchpoints")
			.update(updateData)
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("Error updating touchpoint:", error);
			return NextResponse.json(
				{ error: "Failed to update touchpoint" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Touchpoint update error:", error);
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

		const { error } = await supabase.from("touchpoints").delete().eq("id", id);

		if (error) {
			console.error("Error deleting touchpoint:", error);
			return NextResponse.json(
				{ error: "Failed to delete touchpoint" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Touchpoint deletion error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
