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
			.select("*")
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
		
		// No transformation needed - pass data as-is!
		return NextResponse.json(data);
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