import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
	params: Promise<{ id: string }>;
}

// GET /api/enrollments/[id] - Get a single enrollment
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const supabase = await createClient();
		
		const { data, error } = await supabase
			.from("enrollments")
			.select(`
				*,
				students(id, full_name, email),
				cohorts(id, format, starting_level, start_date)
			`)
			.eq("id", id)
			.single();
		
		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Enrollment not found" },
					{ status: 404 }
				);
			}
			console.error("Error fetching enrollment:", error);
			return NextResponse.json(
				{ error: "Failed to fetch enrollment" },
				{ status: 500 }
			);
		}
		
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in GET /api/enrollments/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// PATCH /api/enrollments/[id] - Update an enrollment
export async function PATCH(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const supabase = await createClient();
		const body = await request.json();
		
		const updateData = {
			status: body.status,
			updated_at: new Date().toISOString(),
		};
		
		const { data, error } = await supabase
			.from("enrollments")
			.update(updateData)
			.eq("id", id)
			.select()
			.single();
		
		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Enrollment not found" },
					{ status: 404 }
				);
			}
			console.error("Error updating enrollment:", error);
			return NextResponse.json(
				{ error: "Failed to update enrollment" },
				{ status: 500 }
			);
		}
		
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in PATCH /api/enrollments/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// DELETE /api/enrollments/[id] - Delete an enrollment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const supabase = await createClient();
		
		const { error } = await supabase
			.from("enrollments")
			.delete()
			.eq("id", id);
		
		if (error) {
			console.error("Error deleting enrollment:", error);
			return NextResponse.json(
				{ error: "Failed to delete enrollment" },
				{ status: 500 }
			);
		}
		
		return NextResponse.json({ message: "Enrollment deleted successfully" });
	} catch (error) {
		console.error("Error in DELETE /api/enrollments/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}