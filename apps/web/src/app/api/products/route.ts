import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// GET /api/products - List products
export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		const searchParams = request.nextUrl.searchParams;

		// Parse query parameters
		const limit = Number.parseInt(searchParams.get("limit") || "100");
		const search = searchParams.get("search") || "";

		// Build query
		let query = supabase
			.from("products")
			.select("*", { count: "exact" })
			.limit(limit)
			.order("display_name", { ascending: true });

		// Apply search filter
		if (search) {
			query = query.ilike("display_name", `%${search}%`);
		}

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching products:", error);
			return NextResponse.json(
				{ error: "Failed to fetch products" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			data: data || [],
			meta: {
				total: count || 0,
				limit,
			},
		});
	} catch (error) {
		console.error("Error in GET /api/products:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
