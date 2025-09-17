import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// GET /api/cohorts - List cohorts with pagination and filtering
export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		const searchParams = request.nextUrl.searchParams;

		// Parse query parameters - handle multiple values
		const page = Number.parseInt(searchParams.get("page") || "1");
		const limit = Number.parseInt(searchParams.get("limit") || "10");
		const format = searchParams.getAll("format");
		const cohort_status = searchParams.getAll("cohort_status");
		const starting_level_id = searchParams.getAll("starting_level_id");
		const current_level_id = searchParams.getAll("current_level_id");
		const room_type = searchParams.getAll("room_type");
		const teacher_ids = searchParams.getAll("teacher_ids");
		const sortBy = searchParams.get("sortBy") || "created_at";
		const sortOrder = searchParams.get("sortOrder") || "desc";

		console.log("🔍 Incoming filter params:", {
			cohort_status,
			format,
			starting_level_id,
			room_type,
			teacher_ids,
		});

		// Calculate offset
		const offset = (page - 1) * limit;

		// Build query - change from inner to left join for products
		let query = supabase
			.from("cohorts")
			.select(
				`
				*,
				products (
					id,
					format,
					display_name
				),
				starting_level:language_levels!starting_level_id (
					id,
					code,
					display_name,
					level_group
				),
				current_level:language_levels!current_level_id (
					id,
					code,
					display_name,
					level_group
				),
				weekly_sessions (
					id,
					day_of_week,
					start_time,
					end_time,
					teacher:teachers (
						id,
						first_name,
						last_name
					)
				)
			`,
				{ count: "exact" },
			)
			.range(offset, offset + limit - 1)
			.order(sortBy, { ascending: sortOrder === "asc" });

		// Apply filters - handle multiple values with IN operator
		if (format.length > 0) {
			query = query.in("products.format", format);
		}

		if (cohort_status.length > 0) {
			console.log("Filtering by cohort_status:", cohort_status);
			// Use proper filter for cohort_status
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

		// Filter by teacher IDs - cohorts that have weekly sessions with any of the selected teachers
		if (teacher_ids.length > 0) {
			// Get cohort IDs that have weekly sessions with the selected teachers
			const { data: cohortIds } = await supabase
				.from("weekly_sessions")
				.select("cohort_id")
				.in("teacher_id", teacher_ids);

			if (cohortIds && cohortIds.length > 0) {
				const uniqueCohortIds = [...new Set(cohortIds.map((c) => c.cohort_id))];
				query = query.in("id", uniqueCohortIds);
			} else {
				// No cohorts found with these teachers, return empty result
				query = query.in("id", []);
			}
		}

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching cohorts:", error);
			return NextResponse.json(
				{ error: "Failed to fetch cohorts", details: error.message },
				{ status: 500 },
			);
		}

		// Log the results for debugging
		console.log(`Found ${data?.length || 0} cohorts with filters:`, {
			format,
			cohort_status,
			starting_level_id,
			room_type,
			teacher_ids,
		});

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
			{ status: 500 },
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
				{ status: 500 },
			);
		}

		return NextResponse.json(cohort);
	} catch (error) {
		console.error("Error in POST /api/cohorts:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
