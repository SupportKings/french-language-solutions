import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { z } from "zod";

// GET /api/classes/[id] - Get a single class by ID
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const supabase = await createClient();
		// First get the class with cohort
		const { data: classData, error } = await supabase
			.from("classes")
			.select(
				`
				*,
				cohort:cohorts(*)
			`,
			)
			.eq("id", id)
			.single();

		if (error || !classData) {
			if (error?.code === "PGRST116" || !classData) {
				return NextResponse.json({ error: "Class not found" }, { status: 404 });
			}
			console.error("Error fetching class:", error);
			return NextResponse.json(
				{ error: "Failed to fetch class" },
				{ status: 500 },
			);
		}

		// If there's a teacher_id, fetch teacher separately
		let teacher = null;
		if (classData.teacher_id) {
			const { data: teacherData } = await supabase
				.from("teachers")
				.select("id, first_name, last_name, email")
				.eq("id", classData.teacher_id)
				.single();

			teacher = teacherData;
		}

		const data = {
			...classData,
			teacher,
		};

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in GET /api/classes/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// PUT /api/classes/[id] - Update a class
const updateClassSchema = z.object({
	cohort_id: z.string().uuid().optional(),
	start_time: z.string().datetime().optional(),
	end_time: z.string().datetime().optional(),
	status: z
		.enum(["scheduled", "in_progress", "completed", "cancelled"])
		.optional(),
	google_calendar_event_id: z.string().optional().nullable(),
	meeting_link: z.string().url().optional().nullable(),
	teacher_id: z.string().uuid().optional().nullable(),
	notes: z.string().optional().nullable(),
});

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
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
			.select()
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json({ error: "Class not found" }, { status: 404 });
			}
			console.error("Error updating class:", error);
			return NextResponse.json(
				{ error: "Failed to update class" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation error", details: error.issues },
				{ status: 400 },
			);
		}
		console.error("Error in PUT /api/classes/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// PATCH /api/classes/[id] - Partial update a class
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const body = await request.json();
		const supabase = await createClient();

		// Validate: Internal Notes required when status is completed
		if (body.status === "completed" && (!body.notes || !body.notes.trim())) {
			return NextResponse.json(
				{
					error: "Internal Notes are required when status is set to Completed",
				},
				{ status: 400 },
			);
		}

		// Update the class
		const { data: updatedClass, error } = await supabase
			.from("classes")
			.update({
				...body,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
			.select(
				`
				*,
				cohort:cohorts(*)
			`,
			)
			.single();

		if (error) {
			console.error("Error updating class:", error);
			return NextResponse.json(
				{ error: "Failed to update class" },
				{ status: 500 },
			);
		}

		// If there's a teacher_id, fetch teacher separately
		let teacher = null;
		if (updatedClass?.teacher_id) {
			const { data: teacherData } = await supabase
				.from("teachers")
				.select("id, first_name, last_name, email")
				.eq("id", updatedClass.teacher_id)
				.single();

			teacher = teacherData;
		}

		const data = {
			...updatedClass,
			teacher,
		};

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in PATCH /api/classes/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// DELETE /api/classes/[id] - Hard delete a class
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const supabase = await createClient();

		// First, delete any related attendance records
		const { error: attendanceError } = await supabase
			.from("attendance_records")
			.delete()
			.eq("class_id", id);

		if (attendanceError) {
			console.error("Error deleting attendance records:", attendanceError);
			return NextResponse.json(
				{ error: "Failed to delete related attendance records" },
				{ status: 500 },
			);
			// Continue with class deletion even if attendance deletion fails
		}

		// Now delete the class
		const { error } = await supabase.from("classes").delete().eq("id", id);

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json({ error: "Class not found" }, { status: 404 });
			}
			console.error("Error deleting class:", error);
			return NextResponse.json(
				{ error: "Failed to delete class" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ message: "Class deleted successfully" });
	} catch (error) {
		console.error("Error in DELETE /api/classes/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
