"use server";

import { requireAuth, requirePermission } from "@/lib/rbac-middleware";
import { createClient } from "@/lib/supabase/server";

interface Product {
	id: string;
	display_name: string;
	format: "group" | "private" | "hybrid";
	location: "online" | "in_person" | "hybrid";
	signup_link_for_self_checkout: string | null;
	pandadoc_contract_template_id: string | null;
	created_at: string;
	updated_at: string;
}

export async function getAllProducts(): Promise<Product[]> {
	try {
		// Check authentication and permissions
		await requireAuth();
		await requirePermission("products", ["read"]);

		const supabase = await createClient();

		// Fetch all products without pagination, ordered by display_name
		const { data, error } = await supabase
			.from("products")
			.select("*")
			.order("display_name", { ascending: true });

		if (error) {
			console.error("Error fetching all products:", error);
			throw new Error("Failed to fetch all products");
		}

		return data || [];
	} catch (error) {
		console.error("Error fetching all products:", error);
		throw new Error("Failed to fetch all products");
	}
}
