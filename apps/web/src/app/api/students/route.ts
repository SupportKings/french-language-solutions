import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
	requireAuth,
	isAdmin,
	getCurrentUserCohortIds,
} from "@/lib/rbac-middleware";

// GET /api/students - List students with pagination, search, and filters
export async function GET(request: NextRequest) {
	try {
		// 1. Require authentication
		const session = await requireAuth();
		const userIsAdmin = await isAdmin(session);

		const supabase = await createClient();
		const searchParams = request.nextUrl.searchParams;

		// Parse query parameters - support multiple values for all filter fields
		const page = Number.parseInt(searchParams.get("page") || "1");
		const limit = Number.parseInt(searchParams.get("limit") || "20");
		const search = searchParams.get("search") || "";
		const desired_starting_language_level_id = searchParams.getAll(
			"desired_starting_language_level_id",
		);
		const initial_channel = searchParams.getAll("initial_channel");
		const communication_channel = searchParams.getAll("communication_channel");
		const enrollmentStatus = searchParams.getAll("enrollment_status");
		const is_full_beginner = searchParams.get("is_full_beginner");
		const added_to_email_newsletter = searchParams.get(
			"added_to_email_newsletter",
		);
		const is_under_16 = searchParams.get("is_under_16");
		const dateFrom = searchParams.get("dateFrom") || "";
		const dateTo = searchParams.get("dateTo") || "";
		const useAirtableDate = searchParams.get("useAirtableDate") === "true";
		const sortBy = searchParams.get("sortBy") || "created_at";
		const sortOrder = searchParams.get("sortOrder") || "desc";

		// Calculate offset
		const offset = (page - 1) * limit;

		// 2. Get teacher's cohort IDs for server-side filtering
		let teacherCohortIds: string[] = [];

		if (!userIsAdmin) {
			teacherCohortIds = await getCurrentUserCohortIds(session);
			console.log("👨‍🏫 Teacher cohort IDs for filtering:", teacherCohortIds);

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

			const { data: enrollmentsData } = await supabaseClient
				.from("enrollments")
				.select("student_id")
				.in("cohort_id", teacherCohortIds)
				.in("status", allowedStatuses);

			studentIds = [...new Set(enrollmentsData?.map((e) => e.student_id) || [])];

			console.log(`📊 Found ${studentIds.length} students with allowed enrollments in teacher's cohorts`);

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

		// 4. Build main query with server-side filtering
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

		// Apply other filters at database level
		if (search) {
			query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
		}

		if (desired_starting_language_level_id.length === 1) {
			query = query.eq(
				"desired_starting_language_level_id",
				desired_starting_language_level_id[0],
			);
		}

		if (initial_channel.length === 1) {
			query = query.eq("initial_channel", initial_channel[0]);
		}

		if (is_full_beginner !== null && is_full_beginner !== undefined) {
			query = query.eq("is_full_beginner", is_full_beginner === "true");
		}

		if (
			added_to_email_newsletter !== null &&
			added_to_email_newsletter !== undefined
		) {
			query = query.eq(
				"added_to_email_newsletter",
				added_to_email_newsletter === "true",
			);
		}

		if (is_under_16 !== null && is_under_16 !== undefined) {
			query = query.eq("is_under_16", is_under_16 === "true");
		}

		// Apply sorting and pagination at database level
		query = query
			.order(sortBy, { ascending: sortOrder === "asc" })
			.range(offset, offset + limit - 1);

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching students:", error);
			return NextResponse.json(
				{ error: "Failed to fetch students" },
				{ status: 500 },
			);
		}

		console.log(`📊 Fetched ${data?.length || 0} students (page ${page}, total: ${count})`);

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

		// 6. Apply client-side filters that can't be done at DB level
		let filteredData = processedData;

		// Enrollment status filter (multiple values - in-memory only)
		if (enrollmentStatus.length > 0) {
			filteredData = filteredData.filter((student) =>
				enrollmentStatus.includes(student.enrollment_status),
			);
		}

		// Language level filter (multiple values - in-memory only)
		if (desired_starting_language_level_id.length > 1) {
			filteredData = filteredData.filter((student) =>
				desired_starting_language_level_id.includes(
					student.desired_starting_language_level_id,
				),
			);
		}

		// Initial channel filter (multiple values - in-memory only)
		if (initial_channel.length > 1) {
			filteredData = filteredData.filter((student) =>
				initial_channel.includes(student.initial_channel),
			);
		}

		// Communication channel filter (multiple values - in-memory only)
		if (communication_channel.length > 0) {
			filteredData = filteredData.filter((student) =>
				communication_channel.includes(student.communication_channel),
			);
		}

		// Date filters (in-memory only for complex Airtable date logic)
		if (dateFrom) {
			filteredData = filteredData.filter((student) => {
				const dateToCheck = useAirtableDate
					? student.airtable_created_at || student.created_at
					: student.created_at;
				return new Date(dateToCheck) >= new Date(dateFrom);
			});
		}

		if (dateTo) {
			filteredData = filteredData.filter((student) => {
				const dateToCheck = useAirtableDate
					? student.airtable_created_at || student.created_at
					: student.created_at;
				return new Date(dateToCheck) <= new Date(dateTo);
			});
		}

		// If we applied any in-memory filters, we need to re-paginate
		if (filteredData.length !== processedData.length) {
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
