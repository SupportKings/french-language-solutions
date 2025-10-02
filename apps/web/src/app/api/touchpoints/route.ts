import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const supabase = await createClient();

		// Parse query parameters
		const page = Number.parseInt(searchParams.get("page") || "1");
		const limit = Number.parseInt(searchParams.get("limit") || "10");
		const search = searchParams.get("search");
		const channel = searchParams.getAll("channel");
		const type = searchParams.getAll("type");
		const source = searchParams.getAll("source");

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
			{ count: "exact" },
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

		if (channel.length > 0) {
			query = query.in("channel", channel);
		}

		if (type.length > 0) {
			query = query.in("type", type);
		}

		if (source.length > 0) {
			query = query.in("source", source);
		}

		// Apply pagination
		const start = (page - 1) * limit;
		const end = start + limit - 1;
		query = query.range(start, end);

		// Order by occurred_at desc (most recent first)
		query = query.order("occurred_at", { ascending: false });

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching touchpoints:", error);
			return NextResponse.json(
				{ error: "Failed to fetch touchpoints" },
				{ status: 500 },
			);
		}

		const totalPages = count ? Math.ceil(count / limit) : 0;

		return NextResponse.json({
			data: data || [],
			meta: {
				page,
				limit,
				total: count || 0,
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
