import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/cohorts - List cohorts with pagination and filtering
export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		const searchParams = request.nextUrl.searchParams;
		
		// Parse query parameters - handle multiple values
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");
		const search = searchParams.get("search") || "";
		const format = searchParams.getAll("format");
		const cohort_status = searchParams.getAll("cohort_status");
		const starting_level_id = searchParams.getAll("starting_level_id");
		const current_level_id = searchParams.getAll("current_level_id");
		const room_type = searchParams.getAll("room_type");
		const sortBy = searchParams.get("sortBy") || "created_at";
		const sortOrder = searchParams.get("sortOrder") || "desc";
		
		// Calculate offset
		const offset = (page - 1) * limit;
		
		// Build query - exactly like students
		let query = supabase
			.from("cohorts")
			.select(`
				*,
				products!inner (
					id,
					format,
					display_name
				),
				starting_level:language_levels!starting_level_id (
					id,
					code,
					display_name,
					level_group,
					level_number
				),
				current_level:language_levels!current_level_id (
					id,
					code,
					display_name,
					level_group,
					level_number
				)
			`, { count: "exact" })
			.range(offset, offset + limit - 1)
			.order(sortBy, { ascending: sortOrder === "asc" });
		
		// Apply search filter
		if (search) {
			query = query.or(`starting_level.ilike.%${search}%,current_level.ilike.%${search}%,products.format.ilike.%${search}%`);
		}
		
		// Apply filters - handle multiple values with IN operator
		if (format.length > 0) {
			query = query.in("products.format", format);
		}
		
		if (cohort_status.length > 0) {
			query = query.in("cohort_status", cohort_status);
		}
		
		if (starting_level_id.length > 0) {
			query = query.in("starting_level_id", starting_level_id);
		}
		
		if (current_level_id.length > 0) {
			query = query.in("current_level_id", current_level_id);
		}
		
		if (room_type.length > 0) {
			query = query.in("room_type", room_type);
		}
		
		const { data, error, count } = await query;
		
		if (error) {
			console.error("Error fetching cohorts:", error);
			return NextResponse.json(
				{ error: "Failed to fetch cohorts" },
				{ status: 500 }
			);
		}
		
		// Return in same format as students - using meta instead of pagination
		return NextResponse.json({
			data: data || [],
			meta: {
				total: count || 0,
				page,
				limit,
				totalPages: Math.ceil((count || 0) / limit),
			},
		});
	} catch (error) {
		console.error("Error in GET /api/cohorts:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// POST /api/cohorts - Create a new cohort
export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient();
		const body = await request.json();
		
		// Remove weekly_sessions from body as they need to be handled separately
		const { weekly_sessions, ...cohortData } = body;
		
		// Insert the cohort
		const { data: cohort, error } = await supabase
			.from("cohorts")
			.insert({
				...cohortData,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.select()
			.single();
		
		if (error) {
			console.error("Error creating cohort:", error);
			return NextResponse.json(
				{ error: "Failed to create cohort" },
				{ status: 500 }
			);
		}
		
		return NextResponse.json(cohort);
	} catch (error) {
		console.error("Error in POST /api/cohorts:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}