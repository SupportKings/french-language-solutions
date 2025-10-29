import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

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

// GET /api/enrollments - List all enrollments with filters
export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		const searchParams = request.nextUrl.searchParams;

		// Get query parameters with operator support
		const rawPage = Number.parseInt(searchParams.get("page") || "1");
		const rawLimit = Number.parseInt(searchParams.get("limit") || "20");
		const page = isNaN(rawPage) ? 1 : rawPage;
		const limit = isNaN(rawLimit) ? 20 : rawLimit;

		const search = searchParams.get("search") || "";
		const status = searchParams.getAll("status"); // Support multiple statuses
		const status_operator = searchParams.get("status_operator") || "is any of";
		const productIds = searchParams.getAll("productId"); // Support multiple products
		const productIds_operator = searchParams.get("productIds_operator") || "is any of";
		const dateFrom = searchParams.get("dateFrom") || "";
		const dateTo = searchParams.get("dateTo") || "";
		const created_at_operator = searchParams.get("created_at_operator") || "is between";
		const studentId = searchParams.get("studentId") || "";
		const cohortId = searchParams.get("cohortId") || "";
		const sortBy = searchParams.get("sortBy") || "created_at";
		const sortOrder = searchParams.get("sortOrder") || "desc";

		// Get additional filter arrays
		const cohortFormatArray = searchParams.getAll("cohort_format");
		const cohortStatusArray = searchParams.getAll("cohort_status");
		const startingLevelArray = searchParams.getAll("starting_level");
		const roomTypeArray = searchParams.getAll("room_type");

		// Build query - use inner join when filtering by products to exclude N/A records
		const cohortJoin = productIds.length > 0 ? "cohorts!inner" : "cohorts";
		let query = supabase.from("enrollments").select(
			`
				*,
				students!inner(id, full_name, email),
				${cohortJoin}(
					id,
					nickname,
					starting_level_id,
					current_level_id,
					start_date,
					room_type,
					product_id,
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
						end_time
					)
				)
			`,
			{ count: "exact" },
		);

		// Determine if we need in-memory filtering for operators
		const needsInMemoryFiltering =
			status.length > 0 ||
			productIds.length > 0 ||
			dateFrom ||
			dateTo;

		// Apply database filters only when not using operators (for performance)
		if (!needsInMemoryFiltering) {
			if (status.length > 0 && status_operator === "is any of") {
				query = query.in("status", status);
			}

			if (productIds.length > 0 && productIds_operator === "is any of") {
				// When products are selected, only show enrollments with those products
				// This will exclude enrollments where cohort has no product (null product_id)
				query = query.in("cohorts.product_id", productIds);
			}
		}

		// Date filtering moved to in-memory for operator support

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
			const s = search.replace(/,/g, "\\,");
			query = query.or(`full_name.ilike.%${s}%,email.ilike.%${s}%`, {
				foreignTable: "students",
			});
		}

		// Apply sorting
		const orderColumn =
			sortBy === "student_name" ? "students.full_name" : sortBy;
		query = query.order(orderColumn, { ascending: sortOrder === "asc" });

		// Only apply pagination at DB level if we don't need in-memory filtering
		if (!needsInMemoryFiltering) {
			const from = (page - 1) * limit;
			const to = from + limit - 1;
			query = query.range(from, to);
		}

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching enrollments:", error);
			return NextResponse.json(
				{ error: "Failed to fetch enrollments" },
				{ status: 500 },
			);
		}

		// Apply in-memory filters with operator support
		let filteredData = data || [];

		// Status filter with operator
		if (status.length > 0) {
			filteredData = filteredData.filter((enrollment: any) =>
				applyOptionFilter(enrollment.status, status, status_operator),
			);
		}

		// Product filter with operator
		if (productIds.length > 0) {
			filteredData = filteredData.filter((enrollment: any) =>
				applyOptionFilter(enrollment.cohorts?.product_id, productIds, productIds_operator),
			);
		}

		// Date filters with operator support
		if (dateFrom || dateTo) {
			filteredData = filteredData.filter((enrollment: any) => {
				const itemDate = new Date(enrollment.created_at);
				const fromDateObj = dateFrom ? new Date(dateFrom) : null;
				const toDateObj = dateTo ? new Date(dateTo) : null;

				return applyDateFilter(itemDate, fromDateObj, toDateObj, created_at_operator);
			});
		}

		// Apply pagination to filtered data
		const total = filteredData.length;
		const from = (page - 1) * limit;
		const to = from + limit;
		const paginatedData = needsInMemoryFiltering
			? filteredData.slice(from, to)
			: filteredData;

		return NextResponse.json({
			enrollments: paginatedData,
			pagination: {
				page,
				limit,
				total: needsInMemoryFiltering ? total : (count || 0),
				totalPages: Math.ceil((needsInMemoryFiltering ? total : (count || 0)) / limit),
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
