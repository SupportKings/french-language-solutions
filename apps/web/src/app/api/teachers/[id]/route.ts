import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

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

		// Validate request body (partial update)
		const validatedData = teacherFormSchema.partial().parse(body);

		// Update teacher
		const { data, error } = await supabase
			.from("teachers")
			.update({
				...(validatedData.first_name !== undefined && {
					first_name: validatedData.first_name,
				}),
				...(validatedData.last_name !== undefined && {
					last_name: validatedData.last_name,
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
				...(validatedData.mobile_phone_number !== undefined && {
					mobile_phone_number: validatedData.mobile_phone_number,
				}),
				...(validatedData.admin_notes !== undefined && {
					admin_notes: validatedData.admin_notes,
				}),
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
			.select()
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Teacher not found" },
					{ status: 404 },
				);
			}
			console.error("Error updating teacher:", error);
			return NextResponse.json(
				{ error: "Failed to update teacher" },
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

// DELETE /api/teachers/[id] - Delete a teacher (soft delete)
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const supabase = await createClient();
		const { id } = await params;

		// For now, we'll do a hard delete.
		// In production, you might want to implement soft delete with a deleted_at field
		const { error } = await supabase.from("teachers").delete().eq("id", id);

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Teacher not found" },
					{ status: 404 },
				);
			}
			console.error("Error deleting teacher:", error);
			return NextResponse.json(
				{ error: "Failed to delete teacher" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ message: "Teacher deleted successfully" });
	} catch (error) {
		console.error("Error in DELETE /api/teachers/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
