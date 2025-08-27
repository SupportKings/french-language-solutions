import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
	params: Promise<{ id: string }>;
}

// GET /api/students/[id] - Get a single student
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const supabase = await createClient();
		
		const { data, error } = await supabase
			.from("students")
			.select(`
				*,
				enrollments (
					id,
					status,
					cohort_id,
					created_at,
					updated_at
				)
			`)
			.eq("id", id)
			.is("deleted_at", null)
			.single();
		
		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Student not found" },
					{ status: 404 }
				);
			}
			console.error("Error fetching student:", error);
			return NextResponse.json(
				{ error: "Failed to fetch student" },
				{ status: 500 }
			);
		}
		
		// Add enrollment status from the latest enrollment
		const processedData = {
			...data,
			enrollment_status: null as string | null,
			latest_enrollment: null as any
		};
		
		if (data.enrollments && data.enrollments.length > 0) {
			// Sort enrollments by created_at to get the latest one
			const sortedEnrollments = data.enrollments.sort((a: any, b: any) => 
				new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
			);
			const latestEnrollment = sortedEnrollments[0];
			processedData.enrollment_status = latestEnrollment.status;
			processedData.latest_enrollment = latestEnrollment;
		}
		
		return NextResponse.json(processedData);
	} catch (error) {
		console.error("Error in GET /api/students/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// PATCH /api/students/[id] - Update a student
export async function PATCH(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const supabase = await createClient();
		const body = await request.json();
		
		// Body already uses snake_case from frontend
		const updateData = {
			...body,
			updated_at: new Date().toISOString()
		};
		
		const { data, error } = await supabase
			.from("students")
			.update(updateData)
			.eq("id", id)
			.is("deleted_at", null)
			.select()
			.single();
		
		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Student not found" },
					{ status: 404 }
				);
			}
			console.error("Error updating student:", error);
			return NextResponse.json(
				{ error: "Failed to update student" },
				{ status: 500 }
			);
		}
		
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in PATCH /api/students/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// DELETE /api/students/[id] - Soft delete a student
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const supabase = await createClient();
		
		// Soft delete by setting deleted_at
		const { error } = await supabase
			.from("students")
			.update({ 
				deleted_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			})
			.eq("id", id)
			.is("deleted_at", null);
		
		if (error) {
			console.error("Error deleting student:", error);
			return NextResponse.json(
				{ error: "Failed to delete student" },
				{ status: 500 }
			);
		}
		
		return NextResponse.json({ message: "Student deleted successfully" });
	} catch (error) {
		console.error("Error in DELETE /api/students/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}