import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/rbac-middleware";

import { ProductsTable } from "@/features/products/components/ProductsTable";

import { getUser } from "@/queries/getUser";

export default async function ProductsPage() {
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// Only admins can view and manage products
	await requirePermission("products", ["read"]);

	return <ProductsTable />;
}
