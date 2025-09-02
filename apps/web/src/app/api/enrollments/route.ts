import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// GET /api/enrollments - List all enrollments with filters
export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		const searchParams = request.nextUrl.searchParams;

		// Get query parameters
		const page = Number.parseInt(searchParams.get("page") || "1");
		const limit = Number.parseInt(searchParams.get("limit") || "10");
		const search = searchParams.get("search") || "";
		const statusArray = searchParams.getAll("status");
		const studentId = searchParams.get("studentId") || "";
		const cohortId = searchParams.get("cohortId") || "";
		const sortBy = searchParams.get("sortBy") || "created_at";
		const sortOrder = searchParams.get("sortOrder") || "desc";
		
		// Get additional filter arrays
		const cohortFormatArray = searchParams.getAll("cohort_format");
		const cohortStatusArray = searchParams.getAll("cohort_status");
		const startingLevelArray = searchParams.getAll("starting_level");
		const roomTypeArray = searchParams.getAll("room_type");

		// Build query
		let query = supabase.from("enrollments").select(
			`
				*,
				students!inner(id, full_name, email),
				cohorts!inner(
					id, 
					starting_level_id, 
					current_level_id, 
					start_date,
					room_type,
					cohort_status,
					max_students,
					products (
						id,
						format,
						display_name
					),
					starting_level:language_levels!starting_level_id (
						id,
						code,
						display_name
					),
					current_level:language_levels!current_level_id (
						id,
						code,
						display_name
					),
					weekly_sessions (
						id,
						day_of_week,
						start_time,
						end_time,
						teacher_id
					)
				)
			`,
			{ count: "exact" },
		);

		// Apply filters
		if (statusArray.length > 0) {
			query = query.in("status", statusArray);
		}

		if (studentId) {
			query = query.eq("student_id", studentId);
		}

		if (cohortId) {
			query = query.eq("cohort_id", cohortId);
		}

		// Apply cohort-related filters
		if (cohortFormatArray.length > 0) {
			query = query.in("cohorts.products.format", cohortFormatArray);
		}

		if (cohortStatusArray.length > 0) {
			query = query.in("cohorts.cohort_status", cohortStatusArray);
		}

		if (startingLevelArray.length > 0) {
			query = query.in("cohorts.starting_level.code", startingLevelArray);
		}

		if (roomTypeArray.length > 0) {
			query = query.in("cohorts.room_type", roomTypeArray);
		}

		if (search) {
			query = query.or(
				`students.full_name.ilike.%${search}%,students.email.ilike.%${search}%`,
			);
		}

		// Apply sorting
		const orderColumn =
			sortBy === "student_name" ? "students.full_name" : sortBy;
		query = query.order(orderColumn, { ascending: sortOrder === "asc" });

		// Apply pagination
		const from = (page - 1) * limit;
		const to = from + limit - 1;
		query = query.range(from, to);

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching enrollments:", error);
			return NextResponse.json(
				{ error: "Failed to fetch enrollments" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			enrollments: data || [],
			pagination: {
				page,
				limit,
				total: count || 0,
				totalPages: Math.ceil((count || 0) / limit),
			},
		});
	} catch (error) {
		console.error("Error in GET /api/enrollments:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// POST /api/enrollments - Create a new enrollment
export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient();
		const body = await request.json();

		// Validate required fields
		if (!body.studentId || !body.cohortId) {
			return NextResponse.json(
				{ error: "Student ID and Cohort ID are required" },
				{ status: 400 },
			);
		}

		// Check for existing enrollment
		const { data: existing } = await supabase
			.from("enrollments")
			.select("id")
			.eq("student_id", body.studentId)
			.eq("cohort_id", body.cohortId)
			.single();

		if (existing) {
			return NextResponse.json(
				{ error: "Student is already enrolled in this cohort" },
				{ status: 400 },
			);
		}

		// Create enrollment
		const { data, error } = await supabase
			.from("enrollments")
			.insert({
				student_id: body.studentId,
				cohort_id: body.cohortId,
				status: body.status || "interested",
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating enrollment:", error);
			return NextResponse.json(
				{ error: "Failed to create enrollment" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		console.error("Error in POST /api/enrollments:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
