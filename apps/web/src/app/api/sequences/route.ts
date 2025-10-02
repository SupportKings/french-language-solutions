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

		// Build the query
		let query = supabase.from("template_follow_up_sequences").select(
			`
				*,
				template_follow_up_messages (
					id,
					step_index,
					status,
					time_delay_hours,
					message_content,
					created_at,
					updated_at
				)
			`,
			{ count: "exact" },
		);

		// Apply search filter
		if (search) {
			query = query.or(
				`display_name.ilike.%${search}%,subject.ilike.%${search}%`,
			);
		}

		// Apply pagination
		const start = (page - 1) * limit;
		const end = start + limit - 1;
		query = query.range(start, end);

		// Order by created_at desc
		query = query.order("created_at", { ascending: false });

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching sequences:", error);
			return NextResponse.json(
				{ error: "Failed to fetch sequences" },
				{ status: 500 },
			);
		}

		// Get active counts for each sequence
		const sequenceIds = data?.map((s: any) => s.id) || [];
		const activeCounts: Record<string, number> = {};

		if (sequenceIds.length > 0) {
			// Get counts of active follow-ups (activated or ongoing) for all sequences at once
			const { data: followUpCounts } = await supabase
				.from("automated_follow_ups")
				.select("sequence_id")
				.in("sequence_id", sequenceIds)
				.in("status", ["activated", "ongoing"]);

			// Count by sequence_id
			followUpCounts?.forEach((fu: any) => {
				activeCounts[fu.sequence_id] = (activeCounts[fu.sequence_id] || 0) + 1;
			});
		}

		// Transform data to include count
		const transformedData = data?.map((sequence: any) => ({
			...sequence,
			_count: {
				automated_follow_ups: activeCounts[sequence.id] || 0,
			},
		}));

		const totalPages = count ? Math.ceil(count / limit) : 0;

		return NextResponse.json({
			data: transformedData || [],
			meta: {
				page,
				limit,
				total: count || 0,
				totalPages,
			},
		});
	} catch (error) {
		console.error("Sequences API error:", error);
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
			.from("template_follow_up_sequences")
			.insert({
				display_name: body.display_name,
				subject: body.subject,
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating sequence:", error);
			return NextResponse.json(
				{ error: "Failed to create sequence" },
				{ status: 500 },
			);
		}

		// If messages are provided, create them
		if (body.messages && body.messages.length > 0) {
			const messagesData = body.messages.map((msg: any, index: number) => ({
				sequence_id: data.id,
				step_index: index + 1,
				status: msg.status || "active",
				time_delay_hours: msg.time_delay_hours,
				message_content: msg.message_content,
			}));

			const { error: messagesError } = await supabase
				.from("template_follow_up_messages")
				.insert(messagesData);

			if (messagesError) {
				console.error("Error creating messages:", messagesError);
				// Note: We still return the sequence even if messages fail
			}
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Sequence creation error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
