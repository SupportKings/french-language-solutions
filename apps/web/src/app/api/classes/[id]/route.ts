import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// GET /api/classes/[id] - Get a single class by ID
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const supabase = await createClient();
		const { data, error } = await supabase
			.from("classes")
			.select(`
				*,
				cohort:cohorts(*),
				teachers(
					id,
					first_name,
					last_name,
					email
				)
			`)
			.eq("id", id)
			.is("deleted_at", null)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Class not found" },
					{ status: 404 }
				);
			}
			console.error("Error fetching class:", error);
			return NextResponse.json(
				{ error: "Failed to fetch class" },
				{ status: 500 }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in GET /api/classes/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// PUT /api/classes/[id] - Update a class
const updateClassSchema = z.object({
	cohort_id: z.string().uuid().optional(),
	name: z.string().min(1, "Name is required").optional(),
	description: z.string().optional().nullable(),
	start_time: z.string().datetime().optional(),
	end_time: z.string().datetime().optional(),
	status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
	google_calendar_event_id: z.string().optional().nullable(),
	room: z.string().optional().nullable(),
	meeting_link: z.string().url().optional().nullable(),
	google_drive_folder_id: z.string().optional().nullable(),
	current_enrollment: z.number().int().min(0).optional(),
	teacher_id: z.string().uuid().optional().nullable(),
	notes: z.string().optional().nullable(),
});

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const supabase = await createClient();
		const body = await request.json();
		const validatedData = updateClassSchema.parse(body);

		// Add updated_at timestamp
		const updateData = {
			...validatedData,
			updated_at: new Date().toISOString(),
		};

		const { data, error } = await supabase
			.from("classes")
			.update(updateData)
			.eq("id", id)
			.is("deleted_at", null)
			.select()
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Class not found" },
					{ status: 404 }
				);
			}
			console.error("Error updating class:", error);
			return NextResponse.json(
				{ error: "Failed to update class" },
				{ status: 500 }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation error", details: error.errors },
				{ status: 400 }
			);
		}
		console.error("Error in PUT /api/classes/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// PATCH /api/classes/[id] - Partial update a class
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const body = await request.json();
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("classes")
			.update({
				...body,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
			.is("deleted_at", null)
			.select(`
				*,
				cohort:cohorts(*),
				teachers(
					id,
					first_name,
					last_name,
					email
				)
			`)
			.single();

		if (error) {
			console.error("Error updating class:", error);
			return NextResponse.json(
				{ error: "Failed to update class" },
				{ status: 500 }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in PATCH /api/classes/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// DELETE /api/classes/[id] - Soft delete a class
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const supabase = await createClient();
		const { data, error } = await supabase
			.from("classes")
			.update({ 
				deleted_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
			.is("deleted_at", null)
			.select()
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Class not found" },
					{ status: 404 }
				);
			}
			console.error("Error deleting class:", error);
			return NextResponse.json(
				{ error: "Failed to delete class" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ message: "Class deleted successfully" });
	} catch (error) {
		console.error("Error in DELETE /api/classes/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}