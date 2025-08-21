import type { Student, CreateStudent, UpdateStudent, StudentQuery } from "../schemas/student.schema";

export interface PaginatedResponse<T> {
	data: T[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export const studentsApi = {
	// List students with pagination and filters
	async list(params: StudentQuery): Promise<PaginatedResponse<Student>> {
		const searchParams = new URLSearchParams();
		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				searchParams.append(key, String(value));
			}
		});

		const response = await fetch(`/api/students?${searchParams}`, {
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
		const response = await fetch(`/api/students/${id}`, {
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
		const response = await fetch(`/api/students`, {
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
		const response = await fetch(`/api/students/${id}`, {
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
		const response = await fetch(`/api/students/${id}`, {
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