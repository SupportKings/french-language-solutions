import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { requireAuth, getCurrentUserCohortIds } from "@/lib/rbac-middleware";
import { parseDateString } from "@/lib/date-utils";
import type { Database } from "@/utils/supabase/database.types";

// Helper function to apply option filters based on operator
function applyOptionFilter<T>(
	value: T | null | undefined,
	filterValues: string[],
	operator: string,
): boolean {
	if (filterValues.length === 0) return true;

	const found = filterValues.includes(String(value));

	switch (operator) {
		case "is":
		case "is any of":
			return found;
		case "is not":
		case "is none of":
			return !found;
		default:
			return found;
	}
}

// Helper function to apply date filters based on operator
function applyDateFilter(
	cohortDate: Date,
	fromDate: Date | null,
	toDate: Date | null,
	operator: string,
): boolean {
	if (!fromDate && !toDate) return true;

	switch (operator) {
		case "is":
			if (!fromDate) return true;
			return cohortDate.toDateString() === fromDate.toDateString();
		case "is not":
			if (!fromDate) return true;
			return cohortDate.toDateString() !== fromDate.toDateString();
		case "is before":
			if (!fromDate) return true;
			return cohortDate < fromDate;
		case "is on or after":
			if (!fromDate) return true;
			return cohortDate >= fromDate;
		case "is after":
			if (!fromDate) return true;
			return cohortDate > fromDate;
		case "is on or before":
			if (!fromDate) return true;
			return cohortDate <= fromDate;
		case "is between":
			if (!fromDate || !toDate) return true;
			return cohortDate >= fromDate && cohortDate <= toDate;
		case "is not between":
			if (!fromDate || !toDate) return true;
			return cohortDate < fromDate || cohortDate > toDate;
		default:
			// Default behavior for backward compatibility
			if (fromDate && toDate) {
				return cohortDate >= fromDate && cohortDate <= toDate;
			} else if (fromDate) {
				return cohortDate >= fromDate;
			} else if (toDate) {
				return cohortDate <= toDate;
			}
			return true;
	}
}

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
		const search = searchParams.get("search") || "";
		const format = searchParams.getAll("format");
		const format_operator = searchParams.get("format_operator") || "is any of";
		const location = searchParams.getAll("location");
		const location_operator = searchParams.get("location_operator") || "is any of";
		const cohort_status = searchParams.getAll("cohort_status");
		const cohort_status_operator = searchParams.get("cohort_status_operator") || "is any of";
		const starting_level_id = searchParams.getAll("starting_level_id");
		const starting_level_id_operator = searchParams.get("starting_level_id_operator") || "is any of";
		const current_level_id = searchParams.getAll("current_level_id");
		const current_level_id_operator = searchParams.get("current_level_id_operator") || "is any of";
		const room_type = searchParams.getAll("room_type");
		const room_type_operator = searchParams.get("room_type_operator") || "is any of";
		const teacher_ids = searchParams.getAll("teacher_ids");
		const teacher_ids_operator = searchParams.get("teacher_ids_operator") || "is any of";
		const start_date_from = searchParams.get("start_date_from");
		const start_date_to = searchParams.get("start_date_to");
		const start_date_operator = searchParams.get("start_date_operator") || "is between";
		const today_sessions = searchParams.get("today_sessions") === "true";
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

		// 3. Determine if we need to fetch all records (for in-memory filtering)
		const needsInMemoryFiltering =
			search.length > 0 ||
			format.length > 0 ||
			location.length > 0 ||
			cohort_status.length > 1 ||
			starting_level_id.length > 1 ||
			current_level_id.length > 1 ||
			room_type.length > 1 ||
			teacher_ids.length > 0 ||
			start_date_from ||
			start_date_to ||
			today_sessions;

		// 4. Build query with server-side filtering
		const tableName = "cohorts";

		let query = supabase
			.from(tableName as any)
			.select(
				`
					*,
					products (
						id,
						format,
						location,
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

		// Apply other filters at database level (single values only, when no in-memory filtering needed)
		if (cohort_status.length === 1 && !needsInMemoryFiltering) {
			query = query.eq("cohort_status", cohort_status[0]);
		}

		if (starting_level_id.length === 1 && !needsInMemoryFiltering) {
			query = query.eq("starting_level_id", starting_level_id[0]);
		}

		if (current_level_id.length === 1 && !needsInMemoryFiltering) {
			query = query.eq("current_level_id", current_level_id[0]);
		}

		if (room_type.length === 1 && !needsInMemoryFiltering) {
			query = query.eq("room_type", room_type[0]);
		}

		// Apply default sorting
		query = query.order(sortBy, { ascending: sortOrder === "asc" });

		// Only apply pagination at DB level if we don't need in-memory filtering
		if (!needsInMemoryFiltering) {
			query = query.range(offset, offset + limit - 1);
		}

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching cohorts:", error);
			return NextResponse.json(
				{ error: "Failed to fetch cohorts", details: error.message },
				{ status: 500 },
			);
		}

		// 5. Apply in-memory filters (only when needed)
		let filteredCohorts: any[] = data || [];

		// Search filter (nickname)
		if (search.length > 0) {
			const searchLower = search.toLowerCase();
			filteredCohorts = filteredCohorts.filter((cohort) =>
				cohort.nickname?.toLowerCase().includes(searchLower),
			);
		}

		// Format filter with operator support
		if (format.length > 0) {
			filteredCohorts = filteredCohorts.filter((cohort) =>
				applyOptionFilter(cohort.products?.format, format, format_operator),
			);
		}

		// Location filter with operator support
		if (location.length > 0) {
			filteredCohorts = filteredCohorts.filter((cohort) =>
				applyOptionFilter(cohort.products?.location, location, location_operator),
			);
		}

		// Cohort status filter with operator support
		if (cohort_status.length > 0) {
			filteredCohorts = filteredCohorts.filter((cohort) =>
				applyOptionFilter(cohort.cohort_status, cohort_status, cohort_status_operator),
			);
		}

		// Starting level filter with operator support
		if (starting_level_id.length > 0) {
			filteredCohorts = filteredCohorts.filter((cohort) =>
				applyOptionFilter(cohort.starting_level_id, starting_level_id, starting_level_id_operator),
			);
		}

		// Current level filter with operator support
		if (current_level_id.length > 0) {
			filteredCohorts = filteredCohorts.filter((cohort) =>
				applyOptionFilter(cohort.current_level_id, current_level_id, current_level_id_operator),
			);
		}

		// Room type filter with operator support
		if (room_type.length > 0) {
			filteredCohorts = filteredCohorts.filter((cohort) =>
				applyOptionFilter(cohort.room_type, room_type, room_type_operator),
			);
		}

		// Teacher filter with operator support (complex join - in-memory only)
		if (teacher_ids.length > 0) {
			filteredCohorts = filteredCohorts.filter((cohort) => {
				const cohortTeacherIds =
					cohort.weekly_sessions?.map((ws: any) => ws.teacher?.id).filter(Boolean) || [];

				// Apply operator logic
				switch (teacher_ids_operator) {
					case "is":
					case "is any of":
						return teacher_ids.some((tid) => cohortTeacherIds.includes(tid));
					case "is not":
					case "is none of":
						return !teacher_ids.some((tid) => cohortTeacherIds.includes(tid));
					default:
						return teacher_ids.some((tid) => cohortTeacherIds.includes(tid));
				}
			});
		}

		// Date filter with operator support
		if (start_date_from || start_date_to) {
			filteredCohorts = filteredCohorts.filter((cohort) => {
				if (!cohort.start_date) return false;
				const cohortDate = parseDateString(cohort.start_date);

				const fromDate = start_date_from ? new Date(start_date_from) : null;
				const toDate = start_date_to ? new Date(start_date_to) : null;

				return applyDateFilter(cohortDate, fromDate, toDate, start_date_operator);
			});
		}

		// Today's sessions filter
		if (today_sessions) {
			const now = new Date();
			const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as Database["public"]["Enums"]["day_of_week"];

			filteredCohorts = filteredCohorts.filter((cohort) => {
				const sessions = cohort.weekly_sessions || [];
				return sessions.some((session: any) => session.day_of_week === dayOfWeek);
			});
		}

		// 6. Paginate in-memory if needed
		if (needsInMemoryFiltering) {
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
