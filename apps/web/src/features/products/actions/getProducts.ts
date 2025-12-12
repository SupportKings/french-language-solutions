"use server";

import { requireAuth, requirePermission } from "@/lib/rbac-middleware";
import { createClient } from "@/lib/supabase/server";

import type { ProductQuery } from "../queries/useProducts";

interface ProductsResponse {
	data: Array<{
		id: string;
		display_name: string;
		format: "group" | "private" | "hybrid";
		location: "online" | "in_person" | "hybrid";
		signup_link_for_self_checkout: string | null;
		pandadoc_contract_template_id: string | null;
		created_at: string;
		updated_at: string;
	}>;
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export async function getProducts(
	query: ProductQuery,
): Promise<ProductsResponse> {
	try {
		// Check authentication and permissions
		await requireAuth();
		await requirePermission("products", ["read"]);

		const supabase = await createClient();

		// Parse and validate query parameters
		const page = Math.max(1, query.page);
		const limit = Math.min(100, Math.max(1, query.limit));
		const search = query.search || "";

		// Validate and map sortBy to allowed columns
		const allowedSortColumns: Record<string, string> = {
			display_name: "display_name",
			format: "format",
			location: "location",
			created_at: "created_at",
			updated_at: "updated_at",
		};
		const sortBy =
			allowedSortColumns[query.sortBy || "display_name"] || "display_name";
		const sortOrder = query.sortOrder === "desc" ? "desc" : "asc";

		// Calculate offset for pagination
		const offset = Math.max(0, (page - 1) * limit);

		// Build query
		let dbQuery = supabase
			.from("products")
			.select("*", { count: "exact" })
			.range(offset, offset + limit - 1)
			.order(sortBy, { ascending: sortOrder === "asc" });

		// Apply search filter
		if (search) {
			dbQuery = dbQuery.ilike("display_name", `%${search}%`);
		}

		// Apply format filters
		if (query.format) {
			const formatFilters = Array.isArray(query.format)
				? query.format
				: [query.format];
			if (formatFilters.length > 0) {
				dbQuery = dbQuery.in("format", formatFilters);
			}
		}

		// Apply location filters
		if (query.location) {
			const locationFilters = Array.isArray(query.location)
				? query.location
				: [query.location];
			if (locationFilters.length > 0) {
				dbQuery = dbQuery.in("location", locationFilters);
			}
		}

		const { data, error, count } = await dbQuery;

		if (error) {
			console.error("Error fetching products:", error);
			throw new Error("Failed to fetch products");
		}

		const totalPages = Math.ceil((count || 0) / limit);

		return {
			data: data || [],
			meta: {
				total: count || 0,
				page,
				limit,
				totalPages,
			},
		};
	} catch (error) {
		console.error("Error fetching products:", error);
		throw new Error("Failed to fetch products");
	}
}
