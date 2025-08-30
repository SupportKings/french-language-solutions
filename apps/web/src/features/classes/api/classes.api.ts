import type {
	Class,
	ClassFilters,
	ClassFormValues,
} from "../schemas/class.schema";
import { getBaseUrl } from "@/lib/api-utils";

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

// API client functions
export const classesApi = {
	// Get all classes with filters and pagination
	async getClasses(filters?: ClassFilters): Promise<PaginatedResponse<Class>> {
		const params = new URLSearchParams();

		if (filters) {
			if (filters.search) params.append("search", filters.search);
			if (filters.status) params.append("status", filters.status);
			if (filters.mode) params.append("mode", filters.mode);
			if (filters.cohort_id) params.append("cohort_id", filters.cohort_id);
			if (filters.teacher_id) params.append("teacher_id", filters.teacher_id);
			if (filters.is_active !== undefined)
				params.append("is_active", String(filters.is_active));
			params.append("page", String(filters.page || 1));
			params.append("limit", String(filters.limit || 20));
		}

		const baseUrl = getBaseUrl();
		const response = await fetch(
			`${baseUrl}/api/classes?${params.toString()}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to fetch classes");
		}

		return response.json();
	},

	// Get a single class by ID
	async getClass(id: string): Promise<Class> {
		const baseUrl = getBaseUrl();
		const response = await fetch(`${baseUrl}/api/classes/${id}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to fetch class");
		}

		return response.json();
	},

	// Create a new class
	async createClass(data: ClassFormValues): Promise<Class> {
		const baseUrl = getBaseUrl();
		const response = await fetch(`${baseUrl}/api/classes`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to create class");
		}

		return response.json();
	},

	// Update a class
	async updateClass(
		id: string,
		data: Partial<ClassFormValues>,
	): Promise<Class> {
		const baseUrl = getBaseUrl();
		const response = await fetch(`${baseUrl}/api/classes/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to update class");
		}

		return response.json();
	},

	// Delete a class (soft delete)
	async deleteClass(id: string): Promise<void> {
		const baseUrl = getBaseUrl();
		const response = await fetch(`${baseUrl}/api/classes/${id}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to delete class");
		}
	},
};
