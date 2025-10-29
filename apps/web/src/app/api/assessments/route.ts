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
	itemDate: Date | null,
	fromDate: Date | null,
	toDate: Date | null,
	operator: string,
): boolean {
	if (!itemDate) return false; // No date to filter
	if (!fromDate && !toDate) return true;

	// Normalize dates to start of day for date-only comparisons
	const normalizeDate = (date: Date) => {
		const normalized = new Date(date);
		normalized.setHours(0, 0, 0, 0);
		return normalized;
	};

	const itemDateNormalized = normalizeDate(itemDate);
	const fromDateNormalized = fromDate ? normalizeDate(fromDate) : null;
	const toDateNormalized = toDate ? normalizeDate(toDate) : null;

	switch (operator) {
		case "is":
			if (!fromDateNormalized) return true;
			return itemDateNormalized.getTime() === fromDateNormalized.getTime();
		case "is not":
			if (!fromDateNormalized) return true;
			return itemDateNormalized.getTime() !== fromDateNormalized.getTime();
		case "is before":
			if (!fromDateNormalized) return true;
			return itemDateNormalized < fromDateNormalized;
		case "is on or after":
			if (!fromDateNormalized) return true;
			return itemDateNormalized >= fromDateNormalized;
		case "is after":
			if (!fromDateNormalized) return true;
			return itemDateNormalized > fromDateNormalized;
		case "is on or before":
			if (!fromDateNormalized) return true;
			return itemDateNormalized <= fromDateNormalized;
		case "is between":
			if (!fromDateNormalized || !toDateNormalized) return true;
			return itemDateNormalized >= fromDateNormalized && itemDateNormalized <= toDateNormalized;
		case "is not between":
			if (!fromDateNormalized || !toDateNormalized) return true;
			return itemDateNormalized < fromDateNormalized || itemDateNormalized > toDateNormalized;
		default:
			// Default behavior for backward compatibility
			if (fromDateNormalized && toDateNormalized) {
				return itemDateNormalized >= fromDateNormalized && itemDateNormalized <= toDateNormalized;
			} else if (fromDateNormalized) {
				return itemDateNormalized >= fromDateNormalized;
			} else if (toDateNormalized) {
				return itemDateNormalized <= toDateNormalized;
			}
			return true;
	}
}

// GET /api/assessments - List all assessments with filters
export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		const searchParams = request.nextUrl.searchParams;

		// Get query parameters with operator support
		const page = Number.parseInt(searchParams.get("page") || "1");
		const limit = Number.parseInt(searchParams.get("limit") || "10");
		const search = searchParams.get("search") || "";
		const results = searchParams.getAll("result");
		const result_operator = searchParams.get("result_operator") || "is any of";
		const levelIds = searchParams.getAll("level_id");
		const level_id_operator = searchParams.get("level_id_operator") || "is any of";
		const studentId = searchParams.get("studentId") || "";
		const isPaid = searchParams.get("is_paid") || "";
		const is_paid_operator = searchParams.get("is_paid_operator") || "is any of";
		const hasTeachers = searchParams.getAll("has_teacher");
		const has_teacher_operator = searchParams.get("has_teacher_operator") || "is any of";
		const scheduledStatuses = searchParams.getAll("scheduled_status");
		const scheduled_status_operator = searchParams.get("scheduled_status_operator") || "is any of";
		const dateFrom = searchParams.get("date_from") || "";
		const dateTo = searchParams.get("date_to") || "";
		const scheduled_date_operator = searchParams.get("scheduled_date_operator") || "is between";
		const sortBy = searchParams.get("sortBy") || "created_at";
		const sortOrder = searchParams.get("sortOrder") || "desc";

		// Build query
		let query = supabase.from("student_assessments").select(
			`
				*,
				students(id, full_name, email),
				language_level:language_levels!level_id (
					id,
					code,
					display_name,
					level_group
				),
				interview_held_by:teachers!interview_held_by(id, first_name, last_name),
				level_checked_by:teachers!level_checked_by(id, first_name, last_name)
			`,
			{ count: "exact" },
		);

		// Determine if we need in-memory filtering for operators
		const needsInMemoryFiltering =
			results.length > 0 ||
			levelIds.length > 0 ||
			hasTeachers.length > 0 ||
			scheduledStatuses.length > 0 ||
			isPaid !== "" ||
			dateFrom ||
			dateTo;

		// Apply database filters only when using default operator (for performance)
		if (!needsInMemoryFiltering) {
			if (results.length > 0 && result_operator === "is any of") {
				query = query.in("result", results);
			}

			if (levelIds.length > 0 && level_id_operator === "is any of") {
				query = query.in("level_id", levelIds);
			}
		}

		if (studentId) {
			query = query.eq("student_id", studentId);
		}

		// Skip database filters when using in-memory filtering
		if (!needsInMemoryFiltering) {
			if (isPaid !== "") {
				query = query.eq("is_paid", isPaid === "true");
			}

			// Handle teacher assignment filter
			if (hasTeachers.length > 0) {
				if (
					hasTeachers.includes("assigned") &&
					hasTeachers.includes("unassigned")
				) {
					// Both selected, no filter needed
				} else if (hasTeachers.includes("assigned")) {
					query = query.or(
						"interview_held_by.not.is.null,level_checked_by.not.is.null",
					);
				} else if (hasTeachers.includes("unassigned")) {
					query = query
						.is("interview_held_by", null)
						.is("level_checked_by", null);
				}
			}

			// Handle scheduling status filter
			if (scheduledStatuses.length > 0) {
				const conditions = [];
				if (scheduledStatuses.includes("scheduled")) {
					conditions.push("scheduled_for.not.is.null");
				}
				if (scheduledStatuses.includes("not_scheduled")) {
					conditions.push("scheduled_for.is.null");
				}
				if (scheduledStatuses.includes("overdue")) {
					// Overdue means scheduled_for is in the past and result is still 'scheduled'
					const now = new Date().toISOString();
					conditions.push(`and(scheduled_for.lt.${now},result.eq.scheduled)`);
				}

				if (conditions.length > 0) {
					query = query.or(conditions.join(","));
				}
			}
		}

		// Date filtering moved to in-memory for operator support

		// Apply search filter - search in joined students table
		if (search) {
			// First, get matching student IDs
			const { data: studentIds } = await supabase
				.from("students")
				.select("id")
				.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

			if (studentIds && studentIds.length > 0) {
				const ids = studentIds.map((s) => s.id);
				query = query.in("student_id", ids);
			} else {
				// No matching students, return empty result
				query = query.eq("student_id", "00000000-0000-0000-0000-000000000000");
			}
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
			console.error("Error fetching assessments:", error);
			return NextResponse.json(
				{ error: "Failed to fetch assessments" },
				{ status: 500 },
			);
		}

		// Apply in-memory filters with operator support
		let filteredData = data || [];

		// Result filter with operator
		if (results.length > 0) {
			filteredData = filteredData.filter((assessment: any) =>
				applyOptionFilter(assessment.result, results, result_operator),
			);
		}

		// Level filter with operator
		if (levelIds.length > 0) {
			filteredData = filteredData.filter((assessment: any) =>
				applyOptionFilter(assessment.level_id, levelIds, level_id_operator),
			);
		}

		// is_paid filter with operator
		if (isPaid !== "") {
			const paidValues = [isPaid];
			filteredData = filteredData.filter((assessment: any) =>
				applyOptionFilter(String(assessment.is_paid), paidValues, is_paid_operator),
			);
		}

		// Teacher assignment filter with operator
		if (hasTeachers.length > 0) {
			filteredData = filteredData.filter((assessment: any) => {
				const hasTeacher = !!(assessment.interview_held_by || assessment.level_checked_by);
				const teacherStatus = hasTeacher ? "assigned" : "unassigned";
				return applyOptionFilter(teacherStatus, hasTeachers, has_teacher_operator);
			});
		}

		// Scheduling status filter with operator
		if (scheduledStatuses.length > 0) {
			filteredData = filteredData.filter((assessment: any) => {
				const now = new Date();
				const scheduledFor = assessment.scheduled_for ? new Date(assessment.scheduled_for) : null;

				let status = "not_scheduled";
				if (scheduledFor) {
					if (scheduledFor < now && assessment.result === "scheduled") {
						status = "overdue";
					} else {
						status = "scheduled";
					}
				}

				return applyOptionFilter(status, scheduledStatuses, scheduled_status_operator);
			});
		}

		// Date filters with operator support for scheduled_for
		if (dateFrom || dateTo) {
			filteredData = filteredData.filter((assessment: any) => {
				const scheduledDate = assessment.scheduled_for ? new Date(assessment.scheduled_for) : null;
				const fromDateObj = dateFrom ? new Date(dateFrom) : null;
				const toDateObj = dateTo ? new Date(dateTo) : null;

				return applyDateFilter(scheduledDate, fromDateObj, toDateObj, scheduled_date_operator);
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
			assessments: paginatedData,
			pagination: {
				page,
				limit,
				total: needsInMemoryFiltering ? total : (count || 0),
				totalPages: Math.ceil((needsInMemoryFiltering ? total : (count || 0)) / limit),
			},
		});
	} catch (error) {
		console.error("Error in GET /api/assessments:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
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
				{ status: 400 },
			);
		}

		// Create assessment
		const { data, error } = await supabase
			.from("student_assessments")
			.insert({
				student_id: body.studentId,
				level_id: body.levelId || null,
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
				{ status: 500 },
			);
		}

		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		console.error("Error in POST /api/assessments:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
