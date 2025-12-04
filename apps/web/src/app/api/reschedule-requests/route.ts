import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import {
	getCurrentUserCohortIds,
	isAdmin,
	requireAuth,
} from "@/lib/rbac-middleware";

export async function GET(request: Request) {
	try {
		const session = await requireAuth();
		const supabase = await createClient();

		const { searchParams } = new URL(request.url);
		const page = Number.parseInt(searchParams.get("page") || "1");
		const limit = Number.parseInt(searchParams.get("limit") || "10");
		const status = searchParams.get("status");
		const cohortId = searchParams.get("cohort_id");
		const studentId = searchParams.get("student_id");

		// Check if user is admin
		const userIsAdmin = await isAdmin(session);
		let cohortIds: string[] | null = null;

		// For teachers, get their assigned cohort IDs
		if (!userIsAdmin) {
			const teacherCohortIds = await getCurrentUserCohortIds(session);

			if (teacherCohortIds.length === 0) {
				// Teacher has no cohorts - return empty result
				return NextResponse.json({
					data: [],
					count: 0,
					page,
					limit,
					totalPages: 0,
				});
			}

			cohortIds = teacherCohortIds;
		}

		// Build query
		let query = supabase
			.from("reschedule_requests")
			.select(
				`
				*,
				student:students!reschedule_requests_student_id_fkey (
					id,
					full_name,
					first_name,
					email
				),
				cohort:cohorts!reschedule_requests_cohort_id_fkey (
					id,
					nickname,
					product:products (
						display_name
					)
				)
			`,
				{ count: "exact" },
			)
			.order("created_at", { ascending: false });

		// Apply RBAC filter for teachers
		if (cohortIds !== null) {
			query = query.in("cohort_id", cohortIds);
		}

		// Apply status filter
		if (status && status !== "all") {
			query = query.eq("status", status);
		}

		// Apply specific cohort filter (if provided)
		if (cohortId) {
			// For teachers, verify they have access to this cohort
			if (cohortIds !== null && !cohortIds.includes(cohortId)) {
				return NextResponse.json({
					data: [],
					count: 0,
					page,
					limit,
					totalPages: 0,
				});
			}
			query = query.eq("cohort_id", cohortId);
		}

		// Apply student filter (if provided)
		if (studentId) {
			query = query.eq("student_id", studentId);
		}

		// Pagination
		const from = (page - 1) * limit;
		const to = from + limit - 1;
		query = query.range(from, to);

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching reschedule requests:", error);
			return NextResponse.json(
				{ error: "Failed to fetch reschedule requests" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			data,
			count: count || 0,
			page,
			limit,
			totalPages: Math.ceil((count || 0) / limit),
		});
	} catch (error) {
		if (error instanceof Error && error.message === "UNAUTHORIZED") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		console.error("Error in reschedule requests API:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
