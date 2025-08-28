import type {
	Cohort,
	CohortQuery,
	CreateCohort,
	UpdateCohort,
	WeeklySession,
} from "../schemas/cohort.schema";

const BASE_URL = "/api/cohorts";

// Response types - matching students API
export interface PaginatedResponse<T> {
	data: T[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export interface CohortWithSessions extends Cohort {
	weekly_sessions: WeeklySession[];
}

export const cohortsApi = {
	// List cohorts with pagination and filters
	async list(params: CohortQuery): Promise<PaginatedResponse<Cohort>> {
		console.log("🚀 API call started with params:", params);
		
		// Log specific filter values
		if (params.cohort_status) {
			console.log("🔍 cohort_status filter:", params.cohort_status);
		}

		const searchParams = new URLSearchParams();
		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				// Handle arrays for multi-select filters
				if (Array.isArray(value)) {
					// Only add if array has items
					if (value.length > 0) {
						console.log(`📍 Adding array param ${key}:`, value);
						value.forEach((v) => searchParams.append(key, String(v)));
					}
				} else {
					searchParams.append(key, String(value));
				}
			}
		});

		const url = `/api/cohorts?${searchParams}`;
		console.log("📞 Making request to:", url);

		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});
		console.log("📥 Response status:", response.status, response.statusText);

		if (!response.ok) {
			console.error("❌ API Error:", response.status, response.statusText);
			throw new Error("Failed to fetch cohorts");
		}

		const result = await response.json();
		console.log("✅ API Response:", result);
		return result;
	},

	// Get single cohort by ID
	async getById(id: string): Promise<Cohort> {
		const response = await fetch(`${BASE_URL}/${id}`);
		if (!response.ok) {
			throw new Error(`Failed to fetch cohort: ${response.statusText}`);
		}
		return response.json();
	},

	// Get cohort with weekly sessions
	async getWithSessions(id: string): Promise<CohortWithSessions> {
		const response = await fetch(`${BASE_URL}/${id}/sessions`);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch cohort with sessions: ${response.statusText}`,
			);
		}
		return response.json();
	},

	// Create new cohort
	async create(data: CreateCohort): Promise<Cohort> {
		const response = await fetch(BASE_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			throw new Error(`Failed to create cohort: ${response.statusText}`);
		}
		return response.json();
	},

	// Update cohort
	async update(id: string, data: UpdateCohort): Promise<Cohort> {
		const response = await fetch(`${BASE_URL}/${id}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			throw new Error(`Failed to update cohort: ${response.statusText}`);
		}
		return response.json();
	},

	// Delete cohort (soft delete)
	async delete(id: string): Promise<void> {
		const response = await fetch(`${BASE_URL}/${id}`, {
			method: "DELETE",
		});
		if (!response.ok) {
			throw new Error(`Failed to delete cohort: ${response.statusText}`);
		}
	},
};
