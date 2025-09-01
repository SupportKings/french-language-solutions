import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { teacherFormSchema } from "@/features/teachers/schemas/teacher.schema";

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

		// Filters - handle multiple values
		const onboardingStatus = searchParams.getAll("onboarding_status");
		const contractType = searchParams.getAll("contract_type");
		const availableForBooking = searchParams.get("available_for_booking");
		const qualifiedForUnder16 = searchParams.get("qualified_for_under_16");
		const availableForOnlineClasses = searchParams.get(
			"available_for_online_classes",
		);
		const availableForInPersonClasses = searchParams.get(
			"available_for_in_person_classes",
		);

		// Calculate offset
		const offset = (page - 1) * limit;

		// Build query for total count
		let countQuery = supabase
			.from("teachers")
			.select("*", { count: "exact", head: true });

		// Build query for data
		let dataQuery = supabase
			.from("teachers")
			.select(`
				id,
				user_id,
				first_name,
				last_name,
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
				mobile_phone_number,
				admin_notes,
				airtable_record_id,
				created_at,
				updated_at
			`)
			.range(offset, offset + limit - 1)
			.order(sortBy, { ascending: sortOrder === "asc" });

		// Apply filters to both queries
		if (search) {
			const searchFilter = `first_name.ilike.%${search}%,last_name.ilike.%${search}%`;
			countQuery = countQuery.or(searchFilter);
			dataQuery = dataQuery.or(searchFilter);
		}

		// Handle multiple values with IN operator
		if (onboardingStatus.length > 0) {
			countQuery = countQuery.in("onboarding_status", onboardingStatus);
			dataQuery = dataQuery.in("onboarding_status", onboardingStatus);
		}

		if (contractType.length > 0) {
			countQuery = countQuery.in("contract_type", contractType);
			dataQuery = dataQuery.in("contract_type", contractType);
		}

		if (availableForBooking !== null && availableForBooking !== undefined) {
			const value = availableForBooking === "true";
			countQuery = countQuery.eq("available_for_booking", value);
			dataQuery = dataQuery.eq("available_for_booking", value);
		}

		if (qualifiedForUnder16 !== null && qualifiedForUnder16 !== undefined) {
			const value = qualifiedForUnder16 === "true";
			countQuery = countQuery.eq("qualified_for_under_16", value);
			dataQuery = dataQuery.eq("qualified_for_under_16", value);
		}

		if (
			availableForOnlineClasses !== null &&
			availableForOnlineClasses !== undefined
		) {
			const value = availableForOnlineClasses === "true";
			countQuery = countQuery.eq("available_for_online_classes", value);
			dataQuery = dataQuery.eq("available_for_online_classes", value);
		}

		if (
			availableForInPersonClasses !== null &&
			availableForInPersonClasses !== undefined
		) {
			const value = availableForInPersonClasses === "true";
			countQuery = countQuery.eq("available_for_in_person_classes", value);
			dataQuery = dataQuery.eq("available_for_in_person_classes", value);
		}

		// Execute queries
		const [{ count }, { data, error }] = await Promise.all([
			countQuery,
			dataQuery,
		]);

		if (error) {
			console.error("Error fetching teachers:", error);
			return NextResponse.json(
				{ error: "Failed to fetch teachers" },
				{ status: 500 },
			);
		}

		// Transform data to match frontend expectations
		// Fetch active cohorts count for each teacher
		const transformedData = await Promise.all(
			(data || []).map(async (teacher) => {
				// Get count of active cohorts (where teacher has weekly sessions and cohort status is not class_ended)
				const { data: sessionsData } = await supabase
					.from("weekly_sessions")
					.select(`
						cohort_id,
						cohorts!inner(
							id,
							cohort_status
						)
					`)
					.eq("teacher_id", teacher.id)
					.neq("cohorts.cohort_status", "class_ended");

				// Count unique cohort IDs
				const uniqueCohortIds = new Set(sessionsData?.map(s => s.cohort_id) || []);

				return {
					...teacher,
					full_name: `${teacher.first_name} ${teacher.last_name}`.trim(),
					active_cohorts_count: uniqueCohortIds.size,
				};
			})
		);

		// Calculate pagination metadata
		const totalPages = Math.ceil((count || 0) / limit);

		return NextResponse.json({
			data: transformedData,
			meta: {
				page,
				limit,
				total: count || 0,
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
				mobile_phone_number: validatedData.mobile_phone_number,
				admin_notes: validatedData.admin_notes,
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating teacher:", error);
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
