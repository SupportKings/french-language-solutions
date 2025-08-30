import type {
	CreateStudent,
	Student,
	StudentQuery,
	UpdateStudent,
} from "../schemas/student.schema";

export interface PaginatedResponse<T> {
	data: T[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

// Helper to get the correct base URL for API calls
function getApiUrl(path: string): string {
	if (typeof window === "undefined") {
		// Server-side: use absolute URL
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:3001`;
		return `${baseUrl}${path}`;
	}
	// Client-side: use relative URL
	return path;
}

export const studentsApi = {
	// List students with pagination and filters
	async list(params: StudentQuery): Promise<PaginatedResponse<Student>> {
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

		const response = await fetch(getApiUrl(`/api/students?${searchParams}`), {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error("Failed to fetch students");
		}

		return response.json();
	},

	// Get single student
	async getById(id: string): Promise<Student> {
		const response = await fetch(getApiUrl(`/api/students/${id}`), {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error("Failed to fetch student");
		}

		return response.json();
	},

	// Create student
	async create(data: CreateStudent): Promise<Student> {
		const response = await fetch(getApiUrl("/api/students"), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error("Failed to create student");
		}

		return response.json();
	},

	// Update student
	async update(id: string, data: UpdateStudent): Promise<Student> {
		const response = await fetch(getApiUrl(`/api/students/${id}`), {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error("Failed to update student");
		}

		return response.json();
	},

	// Delete student
	async delete(id: string): Promise<void> {
		const response = await fetch(getApiUrl(`/api/students/${id}`), {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error("Failed to delete student");
		}
	},
};
