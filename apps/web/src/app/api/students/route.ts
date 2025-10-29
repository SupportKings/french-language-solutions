import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
	requireAuth,
	isAdmin,
	getCurrentUserCohortIds,
} from "@/lib/rbac-middleware";

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
	itemDate: Date,
	fromDate: Date | null,
	toDate: Date | null,
	operator: string,
): boolean {
	if (!fromDate && !toDate) return true;

	switch (operator) {
		case "is":
			if (!fromDate) return true;
			return itemDate.toDateString() === fromDate.toDateString();
		case "is not":
			if (!fromDate) return true;
			return itemDate.toDateString() !== fromDate.toDateString();
		case "is before":
			if (!fromDate) return true;
			return itemDate < fromDate;
		case "is on or after":
			if (!fromDate) return true;
			return itemDate >= fromDate;
		case "is after":
			if (!fromDate) return true;
			return itemDate > fromDate;
		case "is on or before":
			if (!fromDate) return true;
			return itemDate <= fromDate;
		case "is between":
			if (!fromDate || !toDate) return true;
			return itemDate >= fromDate && itemDate <= toDate;
		case "is not between":
			if (!fromDate || !toDate) return true;
			return itemDate < fromDate || itemDate > toDate;
		default:
			// Default behavior for backward compatibility
			if (fromDate && toDate) {
				return itemDate >= fromDate && itemDate <= toDate;
			} else if (fromDate) {
				return itemDate >= fromDate;
			} else if (toDate) {
				return itemDate <= toDate;
			}
			return true;
	}
}

// GET /api/students - List students with pagination, search, and filters
export async function GET(request: NextRequest) {
	try {
		// 1. Require authentication
		const session = await requireAuth();
		const userIsAdmin = await isAdmin(session);

		const supabase = await createClient();
		const searchParams = request.nextUrl.searchParams;

		// Parse query parameters - support multiple values for all filter fields and operators
		const page = Number.parseInt(searchParams.get("page") || "1");
		const limit = Number.parseInt(searchParams.get("limit") || "20");
		const search = searchParams.get("search") || "";
		const desired_starting_language_level_id = searchParams.getAll(
			"desired_starting_language_level_id",
		);
		const desired_starting_language_level_id_operator = searchParams.get("desired_starting_language_level_id_operator") || "is any of";
		const initial_channel = searchParams.getAll("initial_channel");
		const initial_channel_operator = searchParams.get("initial_channel_operator") || "is any of";
		const communication_channel = searchParams.getAll("communication_channel");
		const communication_channel_operator = searchParams.get("communication_channel_operator") || "is any of";
		const enrollmentStatus = searchParams.getAll("enrollment_status");
		const enrollment_status_operator = searchParams.get("enrollment_status_operator") || "is any of";
		const is_full_beginner = searchParams.getAll("is_full_beginner");
		const is_full_beginner_operator = searchParams.get("is_full_beginner_operator") || "is any of";
		const added_to_email_newsletter = searchParams.getAll(
			"added_to_email_newsletter",
		);
		const added_to_email_newsletter_operator = searchParams.get("added_to_email_newsletter_operator") || "is any of";
		const is_under_16 = searchParams.getAll("is_under_16");
		const is_under_16_operator = searchParams.get("is_under_16_operator") || "is any of";
		const dateFrom = searchParams.get("dateFrom") || "";
		const dateTo = searchParams.get("dateTo") || "";
		const created_at_operator = searchParams.get("created_at_operator") || "is between";
		const sortBy = searchParams.get("sortBy") || "created_at";
		const sortOrder = searchParams.get("sortOrder") || "desc";

		// Calculate offset
		const offset = (page - 1) * limit;

		// 2. Get teacher's cohort IDs for server-side filtering
		let teacherCohortIds: string[] = [];

		if (!userIsAdmin) {
			teacherCohortIds = await getCurrentUserCohortIds(session);

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
		}

		// 3. Build query - we'll use a smarter approach for teachers
		// For teachers: Filter students who have enrollments in their cohorts with allowed statuses
		// This is done at the database level using a subquery
		const supabaseClient = await createClient();

		let studentIds: string[] | null = null;

		if (!userIsAdmin) {
			// For teachers: Get student IDs that have paid/welcome_package_sent enrollments in teacher's cohorts
			const allowedStatuses = ["paid", "welcome_package_sent"];

			const { data: enrollmentsData, error: enrollmentsError } = await supabaseClient
				.from("enrollments")
				.select("student_id")
				.in("cohort_id", teacherCohortIds)
				.in("status", allowedStatuses);

			if (enrollmentsError) {
				console.error("Error fetching enrollments for teacher:", {
					error: enrollmentsError,
					cohortIds: teacherCohortIds,
					allowedStatuses,
					sessionUserId: session.user.id,
				});
				return NextResponse.json(
					{ error: "Failed to fetch student enrollments" },
					{ status: 500 },
				);
			}

			studentIds = [...new Set(enrollmentsData?.map((e) => e.student_id) || [])];

			if (studentIds.length === 0) {
				// No students found - return empty result
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
		}

		// 4. Determine if we need in-memory filtering
		const needsInMemoryFiltering =
			enrollmentStatus.length > 0 ||
			desired_starting_language_level_id.length > 1 ||
			initial_channel.length > 1 ||
			communication_channel.length > 0 ||
			is_full_beginner.length > 0 ||
			added_to_email_newsletter.length > 0 ||
			is_under_16.length > 0 ||
			dateFrom ||
			dateTo;

		// 5. Build main query with server-side filtering
		let query = supabase
			.from("students")
			.select(
				`
				*,
				desired_language_level:language_levels!desired_starting_language_level_id (
					id,
					code,
					display_name,
					level_group
				),
				enrollments (
					id,
					status,
					cohort_id,
					created_at,
					updated_at
				)
			`,
				{ count: "exact" },
			)
			.is("deleted_at", null);

		// Apply RBAC filter at database level
		if (studentIds !== null) {
			query = query.in("id", studentIds);
		}

		// Apply other filters at database level (single values only, when no in-memory filtering needed)
		if (search) {
			query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
		}

		if (desired_starting_language_level_id.length === 1 && !needsInMemoryFiltering) {
			query = query.eq(
				"desired_starting_language_level_id",
				desired_starting_language_level_id[0],
			);
		}

		if (initial_channel.length === 1 && !needsInMemoryFiltering) {
			query = query.eq("initial_channel", initial_channel[0]);
		}

		// Boolean filters are now handled in-memory to support "is any of" operation

		// Apply sorting
		query = query.order(sortBy, { ascending: sortOrder === "asc" });

		// Only apply pagination at DB level if we don't need in-memory filtering
		if (!needsInMemoryFiltering) {
			query = query.range(offset, offset + limit - 1);
		}

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching students:", error);
			return NextResponse.json(
				{ error: "Failed to fetch students" },
				{ status: 500 },
			);
		}

		// 5. Process data to add latest enrollment status
		const processedData = (data || []).map((student) => {
			// Find the latest enrollment
			const latestEnrollment = student.enrollments?.sort(
				(a: any, b: any) =>
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			)[0];

			return {
				...student,
				enrollment_status: latestEnrollment?.status || null,
				latest_enrollment: latestEnrollment || null,
			};
		});

		// 6. Apply in-memory filters (when needed) with operator support
		let filteredData = processedData;

		// Enrollment status filter - apply with operator support
		if (enrollmentStatus.length > 0) {
			filteredData = filteredData.filter((student) =>
				applyOptionFilter(student.enrollment_status, enrollmentStatus, enrollment_status_operator),
			);
		}

		// Language level filter - apply with operator support
		if (desired_starting_language_level_id.length > 0) {
			filteredData = filteredData.filter((student) =>
				applyOptionFilter(
					student.desired_starting_language_level_id,
					desired_starting_language_level_id,
					desired_starting_language_level_id_operator,
				),
			);
		}

		// Initial channel filter - apply with operator support
		if (initial_channel.length > 0) {
			filteredData = filteredData.filter((student) =>
				applyOptionFilter(student.initial_channel, initial_channel, initial_channel_operator),
			);
		}

		// Communication channel filter - apply with operator support
		if (communication_channel.length > 0) {
			filteredData = filteredData.filter((student) =>
				applyOptionFilter(student.communication_channel, communication_channel, communication_channel_operator),
			);
		}

		// Boolean filters - apply with operator support
		if (is_full_beginner.length > 0) {
			filteredData = filteredData.filter((student) =>
				applyOptionFilter(student.is_full_beginner, is_full_beginner, is_full_beginner_operator),
			);
		}

		if (added_to_email_newsletter.length > 0) {
			filteredData = filteredData.filter((student) =>
				applyOptionFilter(student.added_to_email_newsletter, added_to_email_newsletter, added_to_email_newsletter_operator),
			);
		}

		if (is_under_16.length > 0) {
			filteredData = filteredData.filter((student) =>
				applyOptionFilter(student.is_under_16, is_under_16, is_under_16_operator),
			);
		}

		// Date filters with operator support
		if (dateFrom || dateTo) {
			filteredData = filteredData.filter((student) => {
				const itemDate = new Date(student.created_at);
				const fromDateObj = dateFrom ? new Date(dateFrom) : null;
				const toDateObj = dateTo ? new Date(dateTo) : null;

				return applyDateFilter(itemDate, fromDateObj, toDateObj, created_at_operator);
			});
		}

		// 7. Paginate in-memory if needed
		if (needsInMemoryFiltering) {
			const startIndex = offset;
			const endIndex = offset + limit;
			const paginatedData = filteredData.slice(startIndex, endIndex);

			return NextResponse.json({
				data: paginatedData,
				meta: {
					total: filteredData.length,
					page,
					limit,
					totalPages: Math.ceil(filteredData.length / limit),
				},
			});
		}

		// No in-memory filters applied - use database count and data
		return NextResponse.json({
			data: filteredData,
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
		if (error.message === "FORBIDDEN") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		console.error("Error in GET /api/students:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// POST /api/students - Create a new student
export async function POST(request: NextRequest) {
	try {
		// 1. Require authentication
		await requireAuth();

		// 2. Check permission (both teachers and admins can create students)
		// Teachers can create students for their cohorts
		// No additional check needed - authenticated users can create

		const supabase = await createClient();
		const body = await request.json();

		// Body already uses snake_case from frontend
		const { data, error } = await supabase
			.from("students")
			.insert(body)
			.select()
			.single();

		if (error) {
			console.error("Error creating student:", error);
			return NextResponse.json(
				{ error: "Failed to create student" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data, { status: 201 });
	} catch (error: any) {
		if (error.message === "UNAUTHORIZED") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		console.error("Error in POST /api/students:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
