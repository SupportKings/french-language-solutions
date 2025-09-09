import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getProducts } from "../actions/getProducts";
import type {
	CreateProductInput,
	UpdateProductInput,
} from "../schemas/product.schema";

export interface ProductQuery {
	page: number;
	limit: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	search?: string;
	format?: string | string[];
	location?: string | string[];
}

// Query keys for products
export const productsQueries = {
	all: () => ["products"] as const,
	lists: () => [...productsQueries.all(), "list"] as const,
	list: (params: ProductQuery) => [...productsQueries.lists(), params] as const,
	details: () => [...productsQueries.all(), "detail"] as const,
	detail: (id: string) => [...productsQueries.details(), id] as const,
};

// Hook to fetch products list
export function useProducts(params: ProductQuery) {
	return useQuery({
		queryKey: productsQueries.list(params),
		queryFn: () => getProducts(params),
	});
}

// Hook to create a product
export function useCreateProduct() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateProductInput) => {
			const response = await fetch("/api/products", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to create product");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: productsQueries.lists() });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create product");
		},
	});
}

// Hook to update a product
export function useUpdateProduct() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateProductInput;
		}) => {
			const response = await fetch(`/api/products/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to update product");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: productsQueries.lists() });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update product");
		},
	});
}

// Hook to delete a product
export function useDeleteProduct() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/products/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to delete product");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: productsQueries.lists() });
			toast.success("Product deleted successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete product");
		},
	});
}
