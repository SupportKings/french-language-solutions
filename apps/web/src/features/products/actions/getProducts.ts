"use server";

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
		const searchParams = new URLSearchParams();

		// Basic pagination
		searchParams.append("page", query.page.toString());
		searchParams.append("limit", query.limit.toString());

		// Sorting
		if (query.sortBy) {
			searchParams.append("sortBy", query.sortBy);
		}
		if (query.sortOrder) {
			searchParams.append("sortOrder", query.sortOrder);
		}

		// Search
		if (query.search) {
			searchParams.append("search", query.search);
		}

		// Filters
		if (query.format) {
			if (Array.isArray(query.format)) {
				query.format.forEach((f) => searchParams.append("format", f));
			} else {
				searchParams.append("format", query.format);
			}
		}

		if (query.location) {
			if (Array.isArray(query.location)) {
				query.location.forEach((l) => searchParams.append("location", l));
			} else {
				searchParams.append("location", query.location);
			}
		}

		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
		const response = await fetch(
			`${baseUrl}/api/products?${searchParams.toString()}`,
			{
				cache: "no-store",
			},
		);

		if (!response.ok) {
			throw new Error("Failed to fetch products");
		}

		const result = await response.json();

		// Transform the response to match expected format
		const totalPages = Math.ceil(result.meta.total / query.limit);

		return {
			data: result.data || [],
			meta: {
				total: result.meta.total || 0,
				page: query.page,
				limit: query.limit,
				totalPages,
			},
		};
	} catch (error) {
		console.error("Error fetching products:", error);
		throw new Error("Failed to fetch products");
	}
}
