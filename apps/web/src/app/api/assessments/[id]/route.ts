import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
	params: Promise<{ id: string }>;
}

// GET /api/assessments/[id] - Get a single assessment
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const supabase = await createClient();
		
		const { data, error } = await supabase
			.from("student_assessments")
			.select(`
				*,
				students(id, full_name, email),
				interview_held_by:teachers!interview_held_by(id, first_name, last_name),
				level_checked_by:teachers!level_checked_by(id, first_name, last_name)
			`)
			.eq("id", id)
			.single();
		
		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Assessment not found" },
					{ status: 404 }
				);
			}
			console.error("Error fetching assessment:", error);
			return NextResponse.json(
				{ error: "Failed to fetch assessment" },
				{ status: 500 }
			);
		}
		
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in GET /api/assessments/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// PATCH /api/assessments/[id] - Update an assessment
export async function PATCH(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const supabase = await createClient();
		const body = await request.json();
		
		const updateData = {
			level: body.level,
			scheduled_for: body.scheduledFor,
			is_paid: body.isPaid,
			result: body.result,
			notes: body.notes,
			interview_held_by: body.interviewHeldBy,
			level_checked_by: body.levelCheckedBy,
			meeting_recording_url: body.meetingRecordingUrl,
			calendar_event_url: body.calendarEventUrl,
			updated_at: new Date().toISOString(),
		};
		
		// Remove undefined values
		Object.keys(updateData).forEach(key => {
			if (updateData[key] === undefined) {
				delete updateData[key];
			}
		});
		
		const { data, error } = await supabase
			.from("student_assessments")
			.update(updateData)
			.eq("id", id)
			.select()
			.single();
		
		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Assessment not found" },
					{ status: 404 }
				);
			}
			console.error("Error updating assessment:", error);
			return NextResponse.json(
				{ error: "Failed to update assessment" },
				{ status: 500 }
			);
		}
		
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in PATCH /api/assessments/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// DELETE /api/assessments/[id] - Delete an assessment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const supabase = await createClient();
		
		const { error } = await supabase
			.from("student_assessments")
			.delete()
			.eq("id", id);
		
		if (error) {
			console.error("Error deleting assessment:", error);
			return NextResponse.json(
				{ error: "Failed to delete assessment" },
				{ status: 500 }
			);
		}
		
		return NextResponse.json({ message: "Assessment deleted successfully" });
	} catch (error) {
		console.error("Error in DELETE /api/assessments/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}