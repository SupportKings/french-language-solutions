import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getEnrollmentsWithFilters } from "@/features/enrollments/queries/getEnrollmentsWithFilters";

// GET /api/enrollments - List all enrollments with filters
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;

		// Parse pagination parameters
		const rawPage = Number.parseInt(searchParams.get("page") || "1");
		const rawLimit = Number.parseInt(searchParams.get("limit") || "20");
		const page = isNaN(rawPage) ? 1 : rawPage;
		const limit = isNaN(rawLimit) ? 20 : rawLimit;

		// Parse search
		const search = searchParams.get("search") || "";

		// Parse sorting
		const sortBy = searchParams.get("sortBy") || "created_at";
		const sortOrder = searchParams.get("sortOrder") || "desc";
		const sorting = [{ id: sortBy, desc: sortOrder === "desc" }];

		// Build filters array from query parameters
		const filters: any[] = [];

		// Status filter
		const status = searchParams.getAll("status");
		if (status.length > 0) {
			filters.push({
				columnId: "status",
				values: status,
				operator: searchParams.get("status_operator") || "is any of",
			});
		}

		// Product filter
		const productIds = searchParams.getAll("productId");
		if (productIds.length > 0) {
			filters.push({
				columnId: "productId",
				values: productIds,
				operator: searchParams.get("productIds_operator") || "is any of",
			});
		}

		// Cohort nickname filter
		const cohortNickname = searchParams.get("cohortNickname");
		if (cohortNickname) {
			filters.push({
				columnId: "cohortNickname",
				values: [cohortNickname],
				operator: searchParams.get("cohortNickname_operator") || "contains",
			});
		}

		// Teacher filter
		const teacherIds = searchParams.getAll("teacherId");
		if (teacherIds.length > 0) {
			filters.push({
				columnId: "teacherId",
				values: teacherIds,
				operator: searchParams.get("teacherIds_operator") || "is any of",
			});
		}

		// Date filter (created_at)
		const dateFrom = searchParams.get("dateFrom");
		const dateTo = searchParams.get("dateTo");
		if (dateFrom || dateTo) {
			filters.push({
				columnId: "created_at",
				values: [dateFrom, dateTo],
				operator: searchParams.get("created_at_operator") || "is between",
			});
		}

		// Cohort format filter
		const cohortFormatArray = searchParams.getAll("cohort_format");
		if (cohortFormatArray.length > 0) {
			filters.push({
				columnId: "cohort_format",
				values: cohortFormatArray,
				operator: "is any of",
			});
		}

		// Cohort status filter
		const cohortStatusArray = searchParams.getAll("cohort_status");
		if (cohortStatusArray.length > 0) {
			filters.push({
				columnId: "cohort_status",
				values: cohortStatusArray,
				operator: "is any of",
			});
		}

		// Starting level filter
		const startingLevelArray = searchParams.getAll("starting_level");
		if (startingLevelArray.length > 0) {
			filters.push({
				columnId: "starting_level",
				values: startingLevelArray,
				operator: "is any of",
			});
		}

		// Room type filter
		const roomTypeArray = searchParams.getAll("room_type");
		if (roomTypeArray.length > 0) {
			filters.push({
				columnId: "room_type",
				values: roomTypeArray,
				operator: "is any of",
			});
		}

		// Completion percentage filter
		const completionMin = searchParams.get("completionMin");
		const completionMax = searchParams.get("completionMax");
		const completionExact = searchParams.get("completionExact");
		const completionExclude = searchParams.get("completionExclude");
		const completionOperator = searchParams.get("completionOperator");

		if (completionExact !== null && completionExact !== "") {
			filters.push({
				columnId: "completion_percentage",
				values: [completionExact],
				operator: "is",
			});
		} else if (completionExclude !== null && completionExclude !== "") {
			filters.push({
				columnId: "completion_percentage",
				values: [completionExclude],
				operator: "is not",
			});
		} else if (completionOperator === "is not between") {
			if (completionMin !== null && completionMax !== null) {
				filters.push({
					columnId: "completion_percentage",
					values: [completionMin, completionMax],
					operator: "is not between",
				});
			}
		} else {
			// Range-based filters
			if (
				(completionMin !== null && completionMin !== "") ||
				(completionMax !== null && completionMax !== "")
			) {
				filters.push({
					columnId: "completion_percentage",
					values: [completionMin, completionMax],
					operator: "is between",
				});
			}
		}

		// Additional filters for specific student or cohort
		const studentId = searchParams.get("studentId");
		if (studentId) {
			filters.push({
				columnId: "student_id",
				values: [studentId],
				operator: "is",
			});
		}

		const cohortId = searchParams.get("cohortId");
		if (cohortId) {
			filters.push({
				columnId: "cohort_id",
				values: [cohortId],
				operator: "is",
			});
		}

		// Call server query function
		const { data, count } = await getEnrollmentsWithFilters(
			filters,
			page - 1, // Convert from 1-based to 0-based
			limit,
			sorting,
			search,
		);

		return NextResponse.json({
			enrollments: data,
			pagination: {
				page,
				limit,
				total: count,
				totalPages: Math.ceil(count / limit),
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
