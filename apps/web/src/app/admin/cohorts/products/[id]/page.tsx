import { QueryClient, dehydrate } from "@tanstack/react-query";
import { HydrationBoundary } from "@tanstack/react-query";

import { ProductDetailPageClient } from "./page-client";
import { productQuery } from "@/features/products/queries/products.queries";

export default async function ProductDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const queryClient = new QueryClient();
	const { id } = await params;

	// Prefetch product data
	await queryClient.prefetchQuery(productQuery(id));

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ProductDetailPageClient productId={id} />
		</HydrationBoundary>
	);
}