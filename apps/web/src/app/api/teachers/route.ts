import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { teacherFormSchema } from "@/features/teachers/schemas/teacher.schema";

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

// GET /api/teachers - List teachers with pagination and filters
export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		const searchParams = request.nextUrl.searchParams;

		// Get query parameters
		const page = Number.parseInt(searchParams.get("page") || "1");
		const limit = Number.parseInt(searchParams.get("limit") || "20");
		const search = searchParams.get("search") || "";
		const sortBy = searchParams.get("sortBy") || "created_at";
		const sortOrder = searchParams.get("sortOrder") || "desc";

		// Filters - handle multiple values with operators
		const onboardingStatus = searchParams.getAll("onboarding_status");
		const onboarding_status_operator = searchParams.get("onboarding_status_operator") || "is any of";
		const contractType = searchParams.getAll("contract_type");
		const contract_type_operator = searchParams.get("contract_type_operator") || "is any of";
		const availableForBooking = searchParams.get("available_for_booking");
		const available_for_booking_operator = searchParams.get("available_for_booking_operator") || "is any of";
		const qualifiedForUnder16 = searchParams.get("qualified_for_under_16");
		const qualified_for_under_16_operator = searchParams.get("qualified_for_under_16_operator") || "is any of";
		const availableForOnlineClasses = searchParams.get(
			"available_for_online_classes",
		);
		const available_for_online_classes_operator = searchParams.get("available_for_online_classes_operator") || "is any of";
		const availableForInPersonClasses = searchParams.get(
			"available_for_in_person_classes",
		);
		const available_for_in_person_classes_operator = searchParams.get("available_for_in_person_classes_operator") || "is any of";
		const daysAvailableOnline = searchParams.getAll("days_available_online");
		const days_available_online_operator = searchParams.get("days_available_online_operator") || "is any of";
		const daysAvailableInPerson = searchParams.getAll(
			"days_available_in_person",
		);
		const days_available_in_person_operator = searchParams.get("days_available_in_person_operator") || "is any of";

		// Determine if we need in-memory filtering for operators
		const needsInMemoryFiltering =
			onboardingStatus.length > 0 ||
			contractType.length > 0 ||
			availableForBooking ||
			qualifiedForUnder16 ||
			availableForOnlineClasses ||
			availableForInPersonClasses ||
			daysAvailableOnline.length > 0 ||
			daysAvailableInPerson.length > 0;

		// Build query for data - fetch all if using in-memory filtering
		let dataQuery = supabase
			.from("teachers")
			.select(`
				id,
				user_id,
				first_name,
				last_name,
				email,
				role,
				group_class_bonus_terms,
				onboarding_status,
				google_calendar_id,
				maximum_hours_per_week,
				maximum_hours_per_day,
				qualified_for_under_16,
				available_for_booking,
				contract_type,
				available_for_online_classes,
				available_for_in_person_classes,
				max_students_in_person,
				max_students_online,
				days_available_online,
				days_available_in_person,
				mobile_phone_number,
				admin_notes,
				airtable_record_id,
				created_at,
				updated_at
			`)
			.order(sortBy, { ascending: sortOrder === "asc" });

		// Only apply range if not doing in-memory filtering
		if (!needsInMemoryFiltering) {
			const offset = (page - 1) * limit;
			dataQuery = dataQuery.range(offset, offset + limit - 1);
		}

		// Apply search filter
		if (search) {
			const searchFilter = `first_name.ilike.%${search}%,last_name.ilike.%${search}%`;
			dataQuery = dataQuery.or(searchFilter);
		}

		// Execute query
		const { data, error, count } = await dataQuery;

		if (error) {
			console.error("Error fetching teachers:", error);
			return NextResponse.json(
				{ error: "Failed to fetch teachers" },
				{ status: 500 },
			);
		}

		// Apply in-memory filters with operator support
		let filteredData = data || [];

		// Onboarding status filter with operator
		if (onboardingStatus.length > 0) {
			filteredData = filteredData.filter((teacher: any) =>
				applyOptionFilter(teacher.onboarding_status, onboardingStatus, onboarding_status_operator),
			);
		}

		// Contract type filter with operator
		if (contractType.length > 0) {
			filteredData = filteredData.filter((teacher: any) =>
				applyOptionFilter(teacher.contract_type, contractType, contract_type_operator),
			);
		}

		// Available for booking filter with operator
		if (availableForBooking !== null && availableForBooking !== undefined) {
			const bookingValues = [availableForBooking];
			filteredData = filteredData.filter((teacher: any) =>
				applyOptionFilter(String(teacher.available_for_booking), bookingValues, available_for_booking_operator),
			);
		}

		// Qualified for under 16 filter with operator
		if (qualifiedForUnder16 !== null && qualifiedForUnder16 !== undefined) {
			const under16Values = [qualifiedForUnder16];
			filteredData = filteredData.filter((teacher: any) =>
				applyOptionFilter(String(teacher.qualified_for_under_16), under16Values, qualified_for_under_16_operator),
			);
		}

		// Available for online classes filter with operator
		if (availableForOnlineClasses !== null && availableForOnlineClasses !== undefined) {
			const onlineValues = [availableForOnlineClasses];
			filteredData = filteredData.filter((teacher: any) =>
				applyOptionFilter(String(teacher.available_for_online_classes), onlineValues, available_for_online_classes_operator),
			);
		}

		// Available for in-person classes filter with operator
		if (availableForInPersonClasses !== null && availableForInPersonClasses !== undefined) {
			const inPersonValues = [availableForInPersonClasses];
			filteredData = filteredData.filter((teacher: any) =>
				applyOptionFilter(String(teacher.available_for_in_person_classes), inPersonValues, available_for_in_person_classes_operator),
			);
		}

		// Days available online filter with operator
		if (daysAvailableOnline.length > 0) {
			filteredData = filteredData.filter((teacher: any) => {
				const teacherDays = teacher.days_available_online || [];
				const hasAnyDay = daysAvailableOnline.some(day => teacherDays.includes(day));

				switch (days_available_online_operator) {
					case "is any of":
						return hasAnyDay;
					case "is none of":
						return !hasAnyDay;
					default:
						return hasAnyDay;
				}
			});
		}

		// Days available in-person filter with operator
		if (daysAvailableInPerson.length > 0) {
			filteredData = filteredData.filter((teacher: any) => {
				const teacherDays = teacher.days_available_in_person || [];
				const hasAnyDay = daysAvailableInPerson.some(day => teacherDays.includes(day));

				switch (days_available_in_person_operator) {
					case "is any of":
						return hasAnyDay;
					case "is none of":
						return !hasAnyDay;
					default:
						return hasAnyDay;
				}
			});
		}

		// Apply pagination to filtered data
		const total = filteredData.length;
		const offset = (page - 1) * limit;
		const paginatedData = needsInMemoryFiltering
			? filteredData.slice(offset, offset + limit)
			: filteredData;

		// Transform data to match frontend expectations
		// Fetch active cohorts count for each teacher
		const teacherIds = paginatedData.map((t) => t.id);
		let countsByTeacher = new Map<string, number>();
		if (teacherIds.length > 0) {
			const { data: sessionRows, error: sessionsError } = await supabase
				.from("weekly_sessions")
				.select(`
					teacher_id,
					cohort_id,
					cohorts!inner(
						cohort_status
					)
				`)
				.in("teacher_id", teacherIds)
				.neq("cohorts.cohort_status", "class_ended");
			if (!sessionsError) {
				const uniq = new Map<string, Set<string>>();
				(sessionRows || []).forEach((r: any) => {
					if (!uniq.has(r.teacher_id)) uniq.set(r.teacher_id, new Set());
					uniq.get(r.teacher_id)!.add(r.cohort_id);
				});
				countsByTeacher = new Map(
					Array.from(uniq.entries()).map(([k, v]) => [k, v.size]),
				);
			} else {
				console.warn(
					"Failed to fetch active cohorts per teacher:",
					sessionsError,
				);
			}
		}

		const transformedData = paginatedData.map((teacher) => ({
			...teacher,
			full_name: `${teacher.first_name} ${teacher.last_name}`.trim(),
			active_cohorts_count: countsByTeacher.get(teacher.id) ?? 0,
		}));
		// Calculate pagination metadata
		const actualTotal = needsInMemoryFiltering ? total : (count || 0);
		const totalPages = Math.ceil(actualTotal / limit);

		return NextResponse.json({
			data: transformedData,
			meta: {
				page,
				limit,
				total: actualTotal,
				totalPages,
			},
		});
	} catch (error) {
		console.error("Error in GET /api/teachers:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// POST /api/teachers - Create a new teacher
export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient();
		const body = await request.json();

		// Validate request body
		const validatedData = teacherFormSchema.parse(body);

		// Insert teacher
		const { data, error } = await supabase
			.from("teachers")
			.insert({
				first_name: validatedData.first_name,
				last_name: validatedData.last_name,
				email: validatedData.email,
				role: validatedData.role,
				group_class_bonus_terms: validatedData.group_class_bonus_terms,
				onboarding_status: validatedData.onboarding_status,
				google_calendar_id: validatedData.google_calendar_id,
				maximum_hours_per_week: validatedData.maximum_hours_per_week,
				maximum_hours_per_day: validatedData.maximum_hours_per_day,
				qualified_for_under_16: validatedData.qualified_for_under_16,
				available_for_booking: validatedData.available_for_booking,
				contract_type: validatedData.contract_type,
				available_for_online_classes:
					validatedData.available_for_online_classes,
				available_for_in_person_classes:
					validatedData.available_for_in_person_classes,
				max_students_in_person: validatedData.max_students_in_person,
				max_students_online: validatedData.max_students_online,
				days_available_online: validatedData.days_available_online,
				days_available_in_person: validatedData.days_available_in_person,
				mobile_phone_number: validatedData.mobile_phone_number,
				admin_notes: validatedData.admin_notes,
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating teacher:", error);

			// Check for unique constraint violation on email
			if (error.code === "23505" && error.message?.includes("teachers_email_unique")) {
				return NextResponse.json(
					{ error: "A teacher with this email already exists" },
					{ status: 409 },
				);
			}

			return NextResponse.json(
				{ error: "Failed to create teacher" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		console.error("Error in POST /api/teachers:", error);
		if (error instanceof Error && error.name === "ZodError") {
			return NextResponse.json(
				{ error: "Invalid request data", details: error },
				{ status: 400 },
			);
		}
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
