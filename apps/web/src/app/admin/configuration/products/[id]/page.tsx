import { redirect } from "next/navigation";

import { rolesMap } from "@/lib/permissions";

import { AccessDenied } from "@/components/ui/access-denied";

import { productQuery } from "@/features/products/queries/products.queries";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { ProductDetailPageClient } from "./page-client";

export default async function ProductDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const session = await getUser();

	if (!session) {
		redirect("/signin");
	}

	// Get user's role and permissions
	const userRole = session.user.role || "teacher";
	const rolePermissions = rolesMap[userRole as keyof typeof rolesMap];
	const permissions = rolePermissions?.statements || {};

	// Check if user has permission to view products
	const canViewProducts =
		(permissions as any)?.products?.includes("read") ||
		(permissions as any)?.products?.includes("write");

	if (!canViewProducts) {
		return (
			<AccessDenied
				message="You don't have permission to view product details. This section is only available to administrators."
				backLink="/admin/cohorts"
				backLinkText="Back to Cohorts"
			/>
		);
	}

	const queryClient = new QueryClient();

	// Prefetch product data
	await queryClient.prefetchQuery(productQuery(id));

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ProductDetailPageClient productId={id} />
		</HydrationBoundary>
	);
}
