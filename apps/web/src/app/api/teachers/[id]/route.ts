import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

import { teacherFormSchema } from "@/features/teachers/schemas/teacher.schema";

// GET /api/teachers/[id] - Get a single teacher
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const supabase = await createClient();
		const { id } = await params;

		const { data, error } = await supabase
			.from("teachers")
			.select(`
				id,
				user_id,
				first_name,
				last_name,
				role,
				group_class_bonus_terms,
				onboarding_status,
				google_calendar_id,
				maximum_hours_per_week,
				maximum_hours_per_day,
				qualified_for_under_16,
				available_for_booking,
				contract_type,
				available_for_online_classes,
				available_for_in_person_classes,
				max_students_in_person,
				max_students_online,
				days_available_online,
				days_available_in_person,
				mobile_phone_number,
				admin_notes,
				airtable_record_id,
				created_at,
				updated_at
			`)
			.eq("id", id)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Teacher not found" },
					{ status: 404 },
				);
			}
			console.error("Error fetching teacher:", error);
			return NextResponse.json(
				{ error: "Failed to fetch teacher" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in GET /api/teachers/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// PATCH /api/teachers/[id] - Update a teacher
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const supabase = await createClient();
		const { id } = await params;
		const body = await request.json();

		// For offboarding, we need to handle user_id being set to null
		// and other fields that might not be in the form schema
		const { user_id, ...formData } = body;

		// Validate request body (partial update)
		let validatedData;
		try {
			// Use partial() to make all fields optional for PATCH requests
			validatedData = teacherFormSchema.partial().parse(formData);
		} catch (zodError) {
			console.error("Validation error in PATCH /api/teachers/[id]:", zodError);
			console.error("Received body:", body);
			throw zodError;
		}

		// Build the update object
		const updateData: any = {
			...(validatedData.first_name !== undefined && {
				first_name: validatedData.first_name,
			}),
			...(validatedData.last_name !== undefined && {
				last_name: validatedData.last_name,
			}),
			...(validatedData.role !== undefined && {
				role: validatedData.role,
			}),
			...(validatedData.group_class_bonus_terms !== undefined && {
				group_class_bonus_terms: validatedData.group_class_bonus_terms,
			}),
			...(validatedData.onboarding_status !== undefined && {
				onboarding_status: validatedData.onboarding_status,
			}),
			...(validatedData.google_calendar_id !== undefined && {
				google_calendar_id: validatedData.google_calendar_id,
			}),
			...(validatedData.maximum_hours_per_week !== undefined && {
				maximum_hours_per_week: validatedData.maximum_hours_per_week,
			}),
			...(validatedData.maximum_hours_per_day !== undefined && {
				maximum_hours_per_day: validatedData.maximum_hours_per_day,
			}),
			...(validatedData.qualified_for_under_16 !== undefined && {
				qualified_for_under_16: validatedData.qualified_for_under_16,
			}),
			...(validatedData.available_for_booking !== undefined && {
				available_for_booking: validatedData.available_for_booking,
			}),
			...(validatedData.contract_type !== undefined && {
				contract_type: validatedData.contract_type,
			}),
			...(validatedData.available_for_online_classes !== undefined && {
				available_for_online_classes:
					validatedData.available_for_online_classes,
			}),
			...(validatedData.available_for_in_person_classes !== undefined && {
				available_for_in_person_classes:
					validatedData.available_for_in_person_classes,
			}),
			...(validatedData.max_students_in_person !== undefined && {
				max_students_in_person: validatedData.max_students_in_person,
			}),
			...(validatedData.max_students_online !== undefined && {
				max_students_online: validatedData.max_students_online,
			}),
			...(validatedData.days_available_online !== undefined && {
				days_available_online: validatedData.days_available_online,
			}),
			...(validatedData.days_available_in_person !== undefined && {
				days_available_in_person: validatedData.days_available_in_person,
			}),
			...(validatedData.mobile_phone_number !== undefined && {
				mobile_phone_number: validatedData.mobile_phone_number,
			}),
			...(validatedData.admin_notes !== undefined && {
				admin_notes: validatedData.admin_notes,
			}),
			// Add user_id if it's provided (for linking user accounts)
			...(user_id !== undefined && { user_id }),
			updated_at: new Date().toISOString(),
		};

		// First check if teacher exists
		const { data: existingTeacher, error: fetchError } = await supabase
			.from("teachers")
			.select("id")
			.eq("id", id)
			.single();

		if (fetchError || !existingTeacher) {
			console.error("Teacher not found with ID:", id);
			return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
		}

		// Update teacher
		const { data, error } = await supabase
			.from("teachers")
			.update(updateData)
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("Error updating teacher:", error);
			console.error("Update data that failed:", updateData);
			return NextResponse.json(
				{ error: "Failed to update teacher", details: error.message },
				{ status: 500 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in PATCH /api/teachers/[id]:", error);
		if (error instanceof Error && error.name === "ZodError") {
			return NextResponse.json(
				{ error: "Invalid request data", details: error },
				{ status: 400 },
			);
		}
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// DELETE /api/teachers/[id] - Delete a teacher completely
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const supabase = await createClient();
		const { id } = await params;

		// First, get the teacher to check if they have a linked user account
		const { data: teacher, error: fetchError } = await supabase
			.from("teachers")
			.select("id, user_id")
			.eq("id", id)
			.single();

		if (fetchError || !teacher) {
			return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
		}

		// If teacher has a user account, delete the user first
		if (teacher.user_id) {
			const { error: deleteUserError } = await supabase
				.from("user")
				.delete()
				.eq("id", teacher.user_id);

			if (deleteUserError) {
				console.error("Error deleting user account:", deleteUserError);
				// Continue with teacher deletion even if user deletion fails
			}
		}

		// Delete the teacher record completely
		const { error: deleteError } = await supabase
			.from("teachers")
			.delete()
			.eq("id", id);

		if (deleteError) {
			console.error("Error deleting teacher:", deleteError);
			return NextResponse.json(
				{ error: "Failed to delete teacher" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			message: "Teacher deleted successfully",
		});
	} catch (error) {
		console.error("Error in DELETE /api/teachers/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
