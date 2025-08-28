import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { id: studentId } = await params;
		const supabase = await createClient();

		// Fetch touchpoints for the student
		const { data: touchpoints, error } = await supabase
			.from("touchpoints")
			.select(`
				id,
				student_id,
				channel,
				type,
				message,
				source,
				automated_follow_up_id,
				external_id,
				external_metadata,
				occurred_at,
				created_at,
				updated_at
			`)
			.eq("student_id", studentId)
			.order("occurred_at", { ascending: false });

		if (error) {
			console.error("Error fetching touchpoints:", error);
			return NextResponse.json(
				{ error: "Failed to fetch touchpoints" },
				{ status: 500 },
			);
		}

		// Transform the data to match component expectations
		const transformedTouchpoints = (touchpoints || []).map((touchpoint) => ({
			id: touchpoint.id,
			student_id: touchpoint.student_id,
			type: touchpoint.channel, // Use channel as type (call, email, sms, whatsapp)
			title: `${touchpoint.type.charAt(0).toUpperCase() + touchpoint.type.slice(1)} ${touchpoint.channel.charAt(0).toUpperCase() + touchpoint.channel.slice(1)}`,
			description: touchpoint.message,
			contact_date: touchpoint.occurred_at,
			duration_minutes: null,
			outcome: null,
			created_at: touchpoint.created_at,
			updated_at: touchpoint.updated_at,
			created_by: null,
		}));

		return NextResponse.json(transformedTouchpoints);
	} catch (error) {
		console.error("Error in GET /api/students/[id]/touchpoints:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
