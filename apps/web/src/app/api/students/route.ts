import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/students - List students with pagination, search, and filters
export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		const searchParams = request.nextUrl.searchParams;
		
		// Parse query parameters
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "20");
		const search = searchParams.get("search") || "";
		const desired_starting_language_level = searchParams.get("desired_starting_language_level");
		const initial_channel = searchParams.get("initial_channel");
		const sortBy = searchParams.get("sortBy") || "created_at";
		const sortOrder = searchParams.get("sortOrder") || "desc";
		
		// Calculate offset
		const offset = (page - 1) * limit;
		
		// Build query
		let query = supabase
			.from("students")
			.select("*", { count: "exact" })
			.is("deleted_at", null) // Exclude soft deleted
			.range(offset, offset + limit - 1)
			.order(sortBy, { ascending: sortOrder === "asc" });
		
		// Apply search filter (across full_name and email)
		if (search) {
			query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
		}
		
		// Apply level filter
		if (desired_starting_language_level) {
			query = query.eq("desired_starting_language_level", desired_starting_language_level);
		}
		
		// Apply initial channel filter
		if (initial_channel) {
			query = query.eq("initial_channel", initial_channel);
		}
		
		const { data, error, count } = await query;
		
		if (error) {
			console.error("Error fetching students:", error);
			return NextResponse.json(
				{ error: "Failed to fetch students" },
				{ status: 500 }
			);
		}
		
		// No transformation needed - pass data as-is!
		return NextResponse.json({
			data: data || [],
			meta: {
				total: count || 0,
				page,
				limit,
				totalPages: Math.ceil((count || 0) / limit),
			},
		});
	} catch (error) {
		console.error("Error in GET /api/students:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// POST /api/students - Create a new student
export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient();
		const body = await request.json();
		
		// Body already uses snake_case from frontend
		const { data, error } = await supabase
			.from("students")
			.insert(body)
			.select()
			.single();
		
		if (error) {
			console.error("Error creating student:", error);
			return NextResponse.json(
				{ error: "Failed to create student" },
				{ status: 500 }
			);
		}
		
		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		console.error("Error in POST /api/students:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}