import { type NextRequest, NextResponse } from "next/server";

import { requireAuth, requirePermission } from "@/lib/rbac-middleware";
import { createClient } from "@/lib/supabase/server";

import { updateProductSchema } from "@/features/products/schemas/product.schema";

// GET /api/products/[id] - Get a single product
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		await requireAuth();
		await requirePermission("products", ["read"]);

		const supabase = await createClient();
		const { id } = await params;

		const { data, error } = await supabase
			.from("products")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			console.error("Error fetching product:", error);
			return NextResponse.json({ error: "Product not found" }, { status: 404 });
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in GET /api/products/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

// PATCH /api/products/[id] - Update a product
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		await requireAuth();
		await requirePermission("products", ["write"]);

		const supabase = await createClient();
		const { id } = await params;
		const body = await request.json();

		// Validate input
		const validatedData = updateProductSchema.parse(body);

		// Update product
		const { data, error } = await supabase
			.from("products")
			.update({
				...(validatedData.display_name && {
					display_name: validatedData.display_name,
				}),
				...(validatedData.format && { format: validatedData.format }),
				...(validatedData.location && { location: validatedData.location }),
				...(validatedData.pandadoc_contract_template_id !== undefined && {
					pandadoc_contract_template_id:
						validatedData.pandadoc_contract_template_id || null,
				}),
				...(validatedData.signup_link_for_self_checkout !== undefined && {
					signup_link_for_self_checkout:
						validatedData.signup_link_for_self_checkout || null,
				}),
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("Error updating product:", error);
			return NextResponse.json(
				{ error: "Failed to update product" },
				{ status: 500 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error in PATCH /api/products/[id]:", error);
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

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		await requireAuth();
		await requirePermission("products", ["write"]);

		const supabase = await createClient();
		const { id } = await params;

		// Check if product is assigned to any cohorts
		const { data: cohorts, error: checkError } = await supabase
			.from("cohorts")
			.select("id")
			.eq("product_id", id)
			.limit(1);

		if (checkError) {
			console.error("Error checking product usage:", checkError);
			return NextResponse.json(
				{ error: "Failed to check product usage" },
				{ status: 500 },
			);
		}

		if (cohorts && cohorts.length > 0) {
			return NextResponse.json(
				{ error: "Cannot delete product that is assigned to cohorts" },
				{ status: 400 },
			);
		}

		// Delete product
		const { error } = await supabase.from("products").delete().eq("id", id);

		if (error) {
			console.error("Error deleting product:", error);
			return NextResponse.json(
				{ error: "Failed to delete product" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error in DELETE /api/products/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
