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
		const channel = searchParams.getAll("channel");
		const channel_operator =
			searchParams.get("channel_operator") || "is any of";
		const type = searchParams.getAll("type");
		const type_operator = searchParams.get("type_operator") || "is any of";
		const source = searchParams.getAll("source");
		const source_operator = searchParams.get("source_operator") || "is any of";

		// Determine if we need in-memory filtering for operators
		const needsInMemoryFiltering =
			channel.length > 0 || type.length > 0 || source.length > 0;

		// Build the query
		let query = supabase.from("touchpoints").select(
			`
				*,
				students (
					id,
					full_name,
					email,
					mobile_phone_number
				),
				automated_follow_ups (
					id,
					status,
					template_follow_up_sequences (
						display_name
					)
				)
			`,
		);

		// Apply search filter - search in joined students table
		if (search) {
			// First, get matching student IDs
			const { data: studentIds } = await supabase
				.from("students")
				.select("id")
				.or(
					`full_name.ilike.%${search}%,email.ilike.%${search}%,mobile_phone_number.ilike.%${search}%`,
				);

			if (studentIds && studentIds.length > 0) {
				const ids = studentIds.map((s) => s.id);
				query = query.in("student_id", ids);
			} else {
				// No matching students, return empty result
				query = query.eq("student_id", "00000000-0000-0000-0000-000000000000");
			}
		}

		// Order by occurred_at desc (most recent first)
		query = query.order("occurred_at", { ascending: false });

		// Get total count first for pagination
		const { count: totalCount } = await supabase
			.from("touchpoints")
			.select("*", { count: "exact", head: true });

		// Only apply range if not doing in-memory filtering
		if (!needsInMemoryFiltering) {
			const start = (page - 1) * limit;
			const end = start + limit - 1;
			query = query.range(start, end);
		}

		const { data, error } = await query;

		if (error) {
			console.error("Error fetching touchpoints:", error);
			return NextResponse.json(
				{ error: "Failed to fetch touchpoints" },
				{ status: 500 },
			);
		}

		// Apply in-memory filters with operator support
		let filteredData = data || [];

		// Channel filter with operator
		if (channel.length > 0) {
			filteredData = filteredData.filter((touchpoint: any) =>
				applyOptionFilter(touchpoint.channel, channel, channel_operator),
			);
		}

		// Type filter with operator
		if (type.length > 0) {
			filteredData = filteredData.filter((touchpoint: any) =>
				applyOptionFilter(touchpoint.type, type, type_operator),
			);
		}

		// Source filter with operator
		if (source.length > 0) {
			filteredData = filteredData.filter((touchpoint: any) =>
				applyOptionFilter(touchpoint.source, source, source_operator),
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
		console.error("Touchpoints API error:", error);
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
			.from("touchpoints")
			.insert({
				student_id: body.student_id,
				channel: body.channel,
				type: body.type,
				message: body.message,
				source: body.source || "manual",
				automated_follow_up_id: body.automated_follow_up_id || null,
				external_id: body.external_id || null,
				external_metadata: body.external_metadata || null,
				occurred_at: body.occurred_at || new Date().toISOString(),
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating touchpoint:", error);
			return NextResponse.json(
				{ error: "Failed to create touchpoint" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Touchpoint creation error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
