import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/rbac-middleware";
import { getUser } from "@/queries/getUser";

import { ProductForm } from "@/features/products/components/ProductForm";

export default async function NewProductPage() {
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// Only admins can create products
	await requirePermission("products", ["write"]);

	return <ProductForm />;
}
