import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { requireAuth, getCurrentUserCohortIds } from "@/lib/rbac-middleware";
import type { Database } from "@/utils/supabase/database.types";

// GET /api/cohorts - List cohorts with pagination and filtering
export async function GET(request: NextRequest) {
	try {
		// 1. Require authentication
		const session = await requireAuth();

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

		// Calculate offset
		const offset = (page - 1) * limit;

		// 2. Get teacher's cohort IDs for server-side filtering
		const userIsAdmin = session.user.role === "admin";
		let cohortIds: string[] | null = null;

		if (!userIsAdmin) {
			// Teachers only see their assigned cohorts
			const teacherCohortIds = await getCurrentUserCohortIds(session);

			if (teacherCohortIds.length === 0) {
				// Teacher has no cohorts - return empty result immediately
				return NextResponse.json({
					data: [],
					meta: {
						total: 0,
						page,
						limit,
						totalPages: 0,
					},
				});
			}

			cohortIds = teacherCohortIds;
		}

		// 3. Build query with server-side filtering
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
			);

		// Apply RBAC filter at database level
		if (cohortIds !== null) {
			query = query.in("id", cohortIds);
		}

		// Apply other filters at database level (single values only)
		if (cohort_status.length === 1) {
			query = query.eq("cohort_status", cohort_status[0]);
		}

		if (starting_level_id.length === 1) {
			query = query.eq("starting_level_id", starting_level_id[0]);
		}

		if (current_level_id.length === 1) {
			query = query.eq("current_level_id", current_level_id[0]);
		}

		if (room_type.length === 1) {
			query = query.eq("room_type", room_type[0]);
		}

		// Apply sorting and pagination at database level
		query = query
			.order(sortBy, { ascending: sortOrder === "asc" })
			.range(offset, offset + limit - 1);

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching cohorts:", error);
			return NextResponse.json(
				{ error: "Failed to fetch cohorts", details: error.message },
				{ status: 500 },
			);
		}

		// 5. Apply in-memory filters for multi-value filters only
		let filteredCohorts = data || [];

		// Multi-value filters (can't be done efficiently at DB level with PostgREST)
		if (format.length > 1) {
			filteredCohorts = filteredCohorts.filter((cohort) =>
				format.includes(cohort.products?.format),
			);
		}

		if (cohort_status.length > 1) {
			filteredCohorts = filteredCohorts.filter((cohort) =>
				cohort_status.includes(cohort.cohort_status),
			);
		}

		if (starting_level_id.length > 1) {
			filteredCohorts = filteredCohorts.filter((cohort) =>
				starting_level_id.includes(cohort.starting_level_id),
			);
		}

		if (current_level_id.length > 1) {
			filteredCohorts = filteredCohorts.filter((cohort) =>
				current_level_id.includes(cohort.current_level_id),
			);
		}

		if (room_type.length > 1) {
			filteredCohorts = filteredCohorts.filter((cohort) =>
				room_type.includes(cohort.room_type),
			);
		}

		// Teacher filter (complex join - in-memory only)
		if (teacher_ids.length > 0) {
			filteredCohorts = filteredCohorts.filter((cohort) => {
				const cohortTeacherIds =
					cohort.weekly_sessions?.map((ws: any) => ws.teacher?.id) || [];
				return teacher_ids.some((tid) => cohortTeacherIds.includes(tid));
			});
		}

		// If we applied any in-memory filters, we need to re-paginate
		if (filteredCohorts.length !== (data?.length || 0)) {
			const startIndex = offset;
			const endIndex = offset + limit;
			const paginatedCohorts = filteredCohorts.slice(startIndex, endIndex);

			return NextResponse.json({
				data: paginatedCohorts,
				meta: {
					total: filteredCohorts.length,
					page,
					limit,
					totalPages: Math.ceil(filteredCohorts.length / limit),
				},
			});
		}

		// No in-memory filters applied - use database count and data
		return NextResponse.json({
			data: data || [],
			meta: {
				total: count || 0,
				page,
				limit,
				totalPages: Math.ceil((count || 0) / limit),
			},
		});
	} catch (error: any) {
		if (error.message === "UNAUTHORIZED") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		console.error("Error in GET /api/cohorts:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// Zod schema for cohort creation - explicit field whitelisting
const createCohortSchema = z.object({
	nickname: z.string().min(1, "Nickname is required"),
	cohort_status: z.enum([
		"enrollment_open",
		"enrollment_closed",
		"class_ended",
	]).optional(),
	start_date: z.string().nullable().optional(),
	current_level_id: z.string().uuid().nullable().optional(),
	starting_level_id: z.string().uuid().nullable().optional(),
	product_id: z.string().uuid().nullable().optional(),
	max_students: z.number().int().positive().nullable().optional(),
	room_type: z.enum(["for_one_to_one", "medium", "medium_plus", "large"]).nullable().optional(),
	setup_finalized: z.boolean().nullable().optional(),
	google_drive_folder_id: z.string().nullable().optional(),
	weekly_sessions: z.array(z.any()).optional(), // Handled separately
});

// POST /api/cohorts - Create a new cohort
export async function POST(request: NextRequest) {
	try {
		// 1. Require authentication (both teachers and admins can create cohorts)
		await requireAuth();

		const supabase = await createClient();
		const body = await request.json();

		// 2. Validate and whitelist input fields
		const validation = createCohortSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ error: "Invalid input", details: validation.error.issues },
				{ status: 400 },
			);
		}

		const { weekly_sessions, ...validatedData } = validation.data;

		// 3. Build insert object with only whitelisted fields
		const cohortInsert: Database["public"]["Tables"]["cohorts"]["Insert"] = {
			nickname: validatedData.nickname,
			cohort_status: validatedData.cohort_status,
			start_date: validatedData.start_date,
			current_level_id: validatedData.current_level_id,
			starting_level_id: validatedData.starting_level_id,
			product_id: validatedData.product_id,
			max_students: validatedData.max_students,
			room_type: validatedData.room_type,
			setup_finalized: validatedData.setup_finalized,
			google_drive_folder_id: validatedData.google_drive_folder_id,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		// 4. Insert the cohort
		const { data: cohort, error } = await supabase
			.from("cohorts")
			.insert(cohortInsert)
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
	} catch (error: any) {
		if (error.message === "UNAUTHORIZED") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		console.error("Error in POST /api/cohorts:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
