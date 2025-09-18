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
		const status = searchParams.getAll("status");
		const sequenceIds = searchParams.getAll("sequence_id");
		const studentId = searchParams.get("student_id");

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
			{ count: "exact" },
		);

		// Apply filters
		if (studentId) {
			query = query.eq("student_id", studentId);
		}

		if (sequenceIds.length > 0) {
			query = query.in("sequence_id", sequenceIds);
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

		if (status.length > 0) {
			query = query.in("status", status);
		}

		// Apply pagination
		const start = (page - 1) * limit;
		const end = start + limit - 1;
		query = query.range(start, end);

		// Order by started_at desc, then created_at desc
		query = query.order("started_at", { ascending: false }).order("created_at", { ascending: false });

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching automated follow-ups:", error);
			return NextResponse.json(
				{ error: "Failed to fetch automated follow-ups" },
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
