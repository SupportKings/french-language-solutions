import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// GET /api/assessments - List all assessments with filters
export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		const searchParams = request.nextUrl.searchParams;

		// Get query parameters
		const page = Number.parseInt(searchParams.get("page") || "1");
		const limit = Number.parseInt(searchParams.get("limit") || "10");
		const search = searchParams.get("search") || "";
		const results = searchParams.getAll("result");
		const levelIds = searchParams.getAll("level_id");
		const studentId = searchParams.get("studentId") || "";
		const isPaid = searchParams.get("is_paid") || "";
		const hasTeachers = searchParams.getAll("has_teacher");
		const scheduledStatuses = searchParams.getAll("scheduled_status");
		const dateFrom = searchParams.get("date_from") || "";
		const dateTo = searchParams.get("date_to") || "";
		const dateOperator = searchParams.get("date_operator") || "";
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

		// Apply filters
		if (results.length > 0) {
			query = query.in("result", results);
		}

		if (levelIds.length > 0) {
			query = query.in("level_id", levelIds);
		}

		if (studentId) {
			query = query.eq("student_id", studentId);
		}

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

		// Handle date filtering for scheduled_for based on operator
		if (dateOperator && (dateFrom || dateTo)) {
			switch (dateOperator) {
				case "is":
					if (dateFrom) query = query.eq("scheduled_for", dateFrom);
					break;
				case "is not":
					if (dateFrom) query = query.neq("scheduled_for", dateFrom);
					break;
				case "is before":
					if (dateFrom) query = query.lt("scheduled_for", dateFrom);
					break;
				case "is on or after":
					if (dateFrom) query = query.gte("scheduled_for", dateFrom);
					break;
				case "is after":
					if (dateFrom) query = query.gt("scheduled_for", dateFrom);
					break;
				case "is on or before":
					if (dateFrom) query = query.lte("scheduled_for", dateFrom);
					break;
				case "is between":
					if (dateFrom && dateTo) {
						query = query
							.gte("scheduled_for", dateFrom)
							.lte("scheduled_for", dateTo);
					}
					break;
				case "is not between":
					if (dateFrom && dateTo) {
						query = query.or(
							`scheduled_for.lt.${dateFrom},scheduled_for.gt.${dateTo}`,
						);
					}
					break;
				default:
					// Fallback to range filtering
					if (dateFrom && dateTo) {
						query = query
							.gte("scheduled_for", dateFrom)
							.lte("scheduled_for", dateTo);
					} else if (dateFrom) {
						query = query.gte("scheduled_for", dateFrom);
					} else if (dateTo) {
						query = query.lte("scheduled_for", dateTo);
					}
					break;
			}
		} else if (dateFrom || dateTo) {
			// Fallback for when no operator is specified
			if (dateFrom && dateTo) {
				query = query
					.gte("scheduled_for", dateFrom)
					.lte("scheduled_for", dateTo);
			} else if (dateFrom) {
				query = query.gte("scheduled_for", dateFrom);
			} else if (dateTo) {
				query = query.lte("scheduled_for", dateTo);
			}
		}

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

		// Apply pagination
		const from = (page - 1) * limit;
		const to = from + limit - 1;
		query = query.range(from, to);

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching assessments:", error);
			return NextResponse.json(
				{ error: "Failed to fetch assessments" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			assessments: data || [],
			pagination: {
				page,
				limit,
				total: count || 0,
				totalPages: Math.ceil((count || 0) / limit),
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
