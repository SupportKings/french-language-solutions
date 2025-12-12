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

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const supabase = await createClient();

		// Parse query parameters
		const page = Number.parseInt(searchParams.get("page") || "1");
		const limit = Number.parseInt(searchParams.get("limit") || "10");
		const search = searchParams.get("search");
		const status = searchParams.getAll("status");
		const status_operator = searchParams.get("status_operator") || "is any of";
		const sequenceIds = searchParams.getAll("sequence_id");
		const sequence_id_operator =
			searchParams.get("sequence_id_operator") || "is any of";
		const studentId = searchParams.get("student_id");

		// Determine if we need in-memory filtering for operators
		const needsInMemoryFiltering = status.length > 0 || sequenceIds.length > 0;

		// Build the query
		let query = supabase.from("automated_follow_ups").select(
			`
				*,
				students (
					id,
					full_name,
					email,
					mobile_phone_number
				),
				sequences:template_follow_up_sequences (
					id,
					display_name,
					subject
				)
			`,
		);

		// Apply filters
		if (studentId) {
			query = query.eq("student_id", studentId);
		}

		if (search) {
			// First get student IDs that match the search
			const { data: matchingStudents } = await supabase
				.from("students")
				.select("id")
				.ilike("full_name", `%${search}%`);

			if (matchingStudents && matchingStudents.length > 0) {
				const studentIds = matchingStudents.map((s) => s.id);
				query = query.in("student_id", studentIds);
			} else {
				// No matching students, return empty result
				query = query.eq("student_id", "00000000-0000-0000-0000-000000000000");
			}
		}

		// Order by started_at desc, then created_at desc
		query = query
			.order("started_at", { ascending: false })
			.order("created_at", { ascending: false });

		// Get total count first for pagination
		const { count: totalCount } = await supabase
			.from("automated_follow_ups")
			.select("*", { count: "exact", head: true });

		// Only apply range if not doing in-memory filtering
		if (!needsInMemoryFiltering) {
			const start = (page - 1) * limit;
			const end = start + limit - 1;
			query = query.range(start, end);
		}

		const { data, error } = await query;

		if (error) {
			console.error("Error fetching automated follow-ups:", error);
			return NextResponse.json(
				{ error: "Failed to fetch automated follow-ups" },
				{ status: 500 },
			);
		}

		// Apply in-memory filters with operator support
		let filteredData = data || [];

		// Status filter with operator
		if (status.length > 0) {
			filteredData = filteredData.filter((followUp: any) =>
				applyOptionFilter(followUp.status, status, status_operator),
			);
		}

		// Sequence ID filter with operator
		if (sequenceIds.length > 0) {
			filteredData = filteredData.filter((followUp: any) =>
				applyOptionFilter(
					followUp.sequence_id,
					sequenceIds,
					sequence_id_operator,
				),
			);
		}

		// Apply pagination to filtered data
		const total = needsInMemoryFiltering
			? filteredData.length
			: totalCount || 0;
		const start = (page - 1) * limit;
		const paginatedData = needsInMemoryFiltering
			? filteredData.slice(start, start + limit)
			: filteredData;

		const totalPages = Math.ceil(total / limit);

		return NextResponse.json({
			data: paginatedData,
			meta: {
				page,
				limit,
				total,
				totalPages,
			},
		});
	} catch (error) {
		console.error("Automated follow-ups API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient();
		const body = await request.json();

		const { data, error } = await supabase
			.from("automated_follow_ups")
			.insert({
				student_id: body.student_id,
				sequence_id: body.sequence_id,
				status: body.status || "activated",
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating automated follow-up:", error);
			return NextResponse.json(
				{ error: "Failed to create automated follow-up" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Automated follow-up creation error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
