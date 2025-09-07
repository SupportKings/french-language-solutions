import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product } from "../schemas/product.schema";

// Query keys
export const productKeys = {
	all: ["products"] as const,
	lists: () => [...productKeys.all, "list"] as const,
	list: (filters?: any) => [...productKeys.lists(), filters] as const,
	details: () => [...productKeys.all, "detail"] as const,
	detail: (id: string) => [...productKeys.details(), id] as const,
};

// Fetch a single product
export const fetchProduct = async (productId: string): Promise<Product> => {
	const response = await fetch(`/api/products/${productId}`);
	if (!response.ok) {
		throw new Error("Failed to fetch product");
	}
	return response.json();
};

// Query option for single product
export const productQuery = (productId: string) =>
	queryOptions({
		queryKey: productKeys.detail(productId),
		queryFn: () => fetchProduct(productId),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

// Hook to use product query
export const useProduct = (productId: string) => {
	return useQuery(productQuery(productId));
};

// Update product mutation
export const useUpdateProduct = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			productId,
			updates,
		}: {
			productId: string;
			updates: Partial<Product>;
		}) => {
			const response = await fetch(`/api/products/${productId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updates),
			});

			if (!response.ok) {
				throw new Error("Failed to update product");
			}

			return response.json();
		},
		onSuccess: (data, { productId }) => {
			// Invalidate and refetch
			queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
			queryClient.invalidateQueries({ queryKey: productKeys.lists() });
		},
	});
};

// Delete product mutation
export const useDeleteProduct = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (productId: string) => {
			const response = await fetch(`/api/products/${productId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete product");
			}

			return response.json();
		},
		onSuccess: () => {
			// Invalidate and refetch all product lists
			queryClient.invalidateQueries({ queryKey: productKeys.lists() });
		},
	});
};