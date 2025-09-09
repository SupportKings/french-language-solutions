import { getApiUrl } from "@/lib/api-utils";

import type {
	AutomatedFollowUp,
	AutomatedFollowUpWithRelations,
	CreateAutomatedFollowUpInput,
	UpdateAutomatedFollowUpInput,
} from "../types/follow-up.types";

export interface AutomatedFollowUpQuery {
	page?: number;
	limit?: number;
	search?: string;
	status?: string[];
	student_id?: string;
	sequence_id?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
	data: T[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export const automatedFollowUpsApi = {
	// List automated follow-ups with pagination and filters
	async list(
		params: AutomatedFollowUpQuery,
	): Promise<PaginatedResponse<AutomatedFollowUp>> {
		const searchParams = new URLSearchParams();
		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				// Handle arrays for multi-select filters
				if (Array.isArray(value)) {
					value.forEach((v) => searchParams.append(key, String(v)));
				} else {
					searchParams.append(key, String(value));
				}
			}
		});

		const response = await fetch(
			getApiUrl(`/api/automated-follow-ups?${searchParams}`),
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) {
			throw new Error("Failed to fetch automated follow-ups");
		}

		return response.json();
	},

	// Get single automated follow-up with relations
	async getById(id: string): Promise<AutomatedFollowUpWithRelations> {
		const response = await fetch(getApiUrl(`/api/automated-follow-ups/${id}`), {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error("Failed to fetch automated follow-up");
		}

		return response.json();
	},

	// Create automated follow-up
	async create(data: CreateAutomatedFollowUpInput): Promise<AutomatedFollowUp> {
		const response = await fetch(getApiUrl("/api/automated-follow-ups"), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				...data,
				started_at: data.started_at || new Date().toISOString(),
				status: data.status || "activated",
			}),
		});

		if (!response.ok) {
			throw new Error("Failed to create automated follow-up");
		}

		return response.json();
	},

	// Update automated follow-up
	async update(
		id: string,
		data: UpdateAutomatedFollowUpInput,
	): Promise<AutomatedFollowUp> {
		const response = await fetch(getApiUrl(`/api/automated-follow-ups/${id}`), {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error("Failed to update automated follow-up");
		}

		return response.json();
	},

	// Delete automated follow-up
	async delete(id: string): Promise<void> {
		const response = await fetch(getApiUrl(`/api/automated-follow-ups/${id}`), {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error("Failed to delete automated follow-up");
		}
	},

	// Stop automated follow-up
	async stop(id: string): Promise<AutomatedFollowUp> {
		const response = await fetch(
			getApiUrl(`/api/automated-follow-ups/${id}/stop`),
			{
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) {
			throw new Error("Failed to stop automated follow-up");
		}

		return response.json();
	},
};
