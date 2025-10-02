import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/rbac-middleware";

interface RouteParams {
	params: Promise<{ id: string }>;
}

// GET /api/assessments/[id] - Get single assessment details
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		// Require authentication
		await requireAuth();

		const supabase = await createClient();

		const { data, error } = await supabase
			.from("student_assessments")
			.select(`
				*,
				students (
					id,
					full_name,
					email,
					mobile_phone_number,
					desired_starting_language_level_id,
					desired_language_level:language_levels!desired_starting_language_level_id (
						id,
						code,
						display_name,
						level_group
					)
				),
				language_level:language_levels!level_id (
					id,
					code,
					display_name,
					level_group
				),
				interview_held_by_teacher:teachers!interview_held_by (
					id,
					first_name,
					last_name
				),
				level_checked_by_teacher:teachers!level_checked_by (
					id,
					first_name,
					last_name
				)
			`)
			.eq("id", id)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Assessment not found" },
					{ status: 404 },
				);
			}
			console.error("Error fetching assessment:", error);
			return NextResponse.json(
				{ error: "Failed to fetch assessment" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in GET /api/assessments/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// PATCH /api/assessments/[id] - Update assessment
export async function PATCH(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		// Require authentication
		await requireAuth();

		const supabase = await createClient();
		const body = await request.json();

		// Remove id from update data if present
		const { id: _, ...updateData } = body;

		// Add updated_at timestamp
		updateData.updated_at = new Date().toISOString();

		const { data, error } = await supabase
			.from("student_assessments")
			.update(updateData)
			.eq("id", id)
			.select(`
				*,
				students (
					id,
					full_name,
					email,
					mobile_phone_number,
					desired_starting_language_level_id,
					desired_language_level:language_levels!desired_starting_language_level_id (
						id,
						code,
						display_name,
						level_group
					)
				),
				language_level:language_levels!level_id (
					id,
					code,
					display_name,
					level_group
				),
				interview_held_by_teacher:teachers!interview_held_by (
					id,
					first_name,
					last_name
				),
				level_checked_by_teacher:teachers!level_checked_by (
					id,
					first_name,
					last_name
				)
			`)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Assessment not found" },
					{ status: 404 },
				);
			}
			console.error("Error updating assessment:", error);
			return NextResponse.json(
				{ error: "Failed to update assessment" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in PATCH /api/assessments/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// DELETE /api/assessments/[id] - Delete assessment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		// Require authentication
		await requireAuth();

		const supabase = await createClient();

		const { error } = await supabase
			.from("student_assessments")
			.delete()
			.eq("id", id);

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Assessment not found" },
					{ status: 404 },
				);
			}
			console.error("Error deleting assessment:", error);
			return NextResponse.json(
				{ error: "Failed to delete assessment" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error in DELETE /api/assessments/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
