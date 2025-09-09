import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { createProductSchema } from "@/features/products/schemas/product.schema";

// GET /api/products - List products
export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		const searchParams = request.nextUrl.searchParams;

		// Parse and validate query parameters
		const rawPage = Number.parseInt(searchParams.get("page") || "1");
		const rawLimit = Number.parseInt(searchParams.get("limit") || "20");

		// Clamp and validate pagination values
		const page = Math.max(1, Number.isNaN(rawPage) ? 1 : rawPage);
		const limit = Math.min(
			100,
			Math.max(1, Number.isNaN(rawLimit) ? 20 : rawLimit),
		);

		const search = searchParams.get("search") || "";

		// Validate and map sortBy to allowed columns
		const allowedSortColumns: Record<string, string> = {
			display_name: "display_name",
			format: "format",
			location: "location",
			created_at: "created_at",
			updated_at: "updated_at",
		};
		const rawSortBy = searchParams.get("sortBy") || "display_name";
		const sortBy = allowedSortColumns[rawSortBy] || "display_name";

		// Validate sortOrder
		const rawSortOrder = searchParams.get("sortOrder") || "asc";
		const sortOrder = rawSortOrder === "desc" ? "desc" : "asc";

		// Filter parameters
		const formatFilters = searchParams.getAll("format");
		const locationFilters = searchParams.getAll("location");

		// Calculate offset for pagination (ensure non-negative)
		const offset = Math.max(0, (page - 1) * limit);

		// Build query
		let query = supabase
			.from("products")
			.select("*", { count: "exact" })
			.range(offset, offset + limit - 1)
			.order(sortBy, { ascending: sortOrder === "asc" });

		// Apply search filter
		if (search) {
			query = query.ilike("display_name", `%${search}%`);
		}

		// Apply format filters
		if (formatFilters.length > 0) {
			query = query.in("format", formatFilters);
		}

		// Apply location filters
		if (locationFilters.length > 0) {
			query = query.in("location", locationFilters);
		}

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching products:", error);
			return NextResponse.json(
				{ error: "Failed to fetch products" },
				{ status: 500 },
			);
		}

		const totalPages = Math.ceil((count || 0) / limit);

		return NextResponse.json({
			data: data || [],
			meta: {
				total: count || 0,
				page,
				limit,
				totalPages,
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

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient();
		const body = await request.json();

		// Validate input
		const validatedData = createProductSchema.parse(body);

		// Create product
		const { data, error } = await supabase
			.from("products")
			.insert({
				display_name: validatedData.display_name,
				format: validatedData.format,
				location: validatedData.location,
				pandadoc_contract_template_id:
					validatedData.pandadoc_contract_template_id || null,
				signup_link_for_self_checkout:
					validatedData.signup_link_for_self_checkout || null,
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating product:", error);
			return NextResponse.json(
				{ error: "Failed to create product" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		console.error("Error in POST /api/products:", error);
		if (error instanceof Error && error.name === "ZodError") {
			return NextResponse.json(
				{ error: "Invalid input data", details: error },
				{ status: 400 },
			);
		}
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
