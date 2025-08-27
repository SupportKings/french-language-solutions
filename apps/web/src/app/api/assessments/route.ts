import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/assessments - List all assessments with filters
export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		const searchParams = request.nextUrl.searchParams;
		
		// Get query parameters
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");
		const search = searchParams.get("search") || "";
		const result = searchParams.get("result") || "";
		const level = searchParams.get("level") || "";
		const studentId = searchParams.get("studentId") || "";
		const isPaid = searchParams.get("isPaid") || "";
		const sortBy = searchParams.get("sortBy") || "created_at";
		const sortOrder = searchParams.get("sortOrder") || "desc";
		
		// Build query
		let query = supabase
			.from("student_assessments")
			.select(`
				*,
				students(id, full_name, email)
			`, { count: "exact" });
		
		// Apply filters
		if (result) {
			query = query.eq("result", result);
		}
		
		if (level) {
			query = query.eq("level", level);
		}
		
		if (studentId) {
			query = query.eq("student_id", studentId);
		}
		
		if (isPaid !== "") {
			query = query.eq("is_paid", isPaid === "true");
		}
		
		if (search) {
			query = query.or(`students.full_name.ilike.%${search}%,students.email.ilike.%${search}%`);
		}
		
		// Apply sorting
		const orderColumn = sortBy === "student_name" ? "students.full_name" : sortBy;
		query = query.order(orderColumn, { ascending: sortOrder === "asc" });
		
		// Apply pagination
		const from = (page - 1) * limit;
		const to = from + limit - 1;
		query = query.range(from, to);
		
		const { data, error, count } = await query;
		
		if (error) {
			console.error("Error fetching assessments:", error);
			return NextResponse.json(
				{ error: "Failed to fetch assessments" },
				{ status: 500 }
			);
		}
		
		return NextResponse.json({
			assessments: data || [],
			pagination: {
				page,
				limit,
				total: count || 0,
				totalPages: Math.ceil((count || 0) / limit),
			},
		});
	} catch (error) {
		console.error("Error in GET /api/assessments:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// POST /api/assessments - Create a new assessment
export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient();
		const body = await request.json();
		
		// Validate required fields
		if (!body.studentId) {
			return NextResponse.json(
				{ error: "Student ID is required" },
				{ status: 400 }
			);
		}
		
		// Create assessment
		const { data, error } = await supabase
			.from("student_assessments")
			.insert({
				student_id: body.studentId,
				level: body.level || null,
				scheduled_for: body.scheduledFor || null,
				is_paid: body.isPaid || false,
				result: body.result || "requested",
				notes: body.notes || null,
				interview_held_by: body.interviewHeldBy || null,
				level_checked_by: body.levelCheckedBy || null,
				meeting_recording_url: body.meetingRecordingUrl || null,
				calendar_event_url: body.calendarEventUrl || null,
			})
			.select()
			.single();
		
		if (error) {
			console.error("Error creating assessment:", error);
			return NextResponse.json(
				{ error: "Failed to create assessment" },
				{ status: 500 }
			);
		}
		
		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		console.error("Error in POST /api/assessments:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}