import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const supabase = await createClient();

		// Parse query parameters
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");
		const search = searchParams.get("search");
		const status = searchParams.getAll("status");

		// Build the query
		let query = supabase
			.from("automated_follow_ups")
			.select(`
				*,
				students (
					id,
					full_name,
					email,
					mobile_phone_number
				),
				template_follow_up_sequences (
					id,
					display_name,
					subject
				)
			`, { count: "exact" });

		// Apply filters
		if (search) {
			query = query.or(`students.full_name.ilike.%${search}%,students.email.ilike.%${search}%,template_follow_up_sequences.display_name.ilike.%${search}%`);
		}

		if (status.length > 0) {
			query = query.in("status", status);
		}

		// Apply pagination
		const start = (page - 1) * limit;
		const end = start + limit - 1;
		query = query.range(start, end);

		// Order by created_at desc
		query = query.order("created_at", { ascending: false });

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching automated follow-ups:", error);
			return NextResponse.json(
				{ error: "Failed to fetch automated follow-ups" },
				{ status: 500 }
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
			{ status: 500 }
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
				{ status: 500 }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Automated follow-up creation error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}