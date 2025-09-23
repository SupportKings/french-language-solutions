import type { Context } from "hono";
import { StudentService } from "./service";

export class StudentController {
	private service: StudentService;

	constructor() {
		this.service = new StudentService();
	}

	async getAll(c: Context) {
		try {
			const limit = Number(c.req.query("limit")) || 50;
			const offset = Number(c.req.query("offset")) || 0;

			const students = await this.service.findAll(limit, offset);

			return c.json({
				success: true,
				data: students,
				count: students.length,
			});
		} catch (error) {
			console.error("Error fetching students:", error);
			return c.json({ success: false, error: "Failed to fetch students" }, 500);
		}
	}

	async getById(c: Context) {
		try {
			const id = c.req.param("id");
			const student = await this.service.findById(id);

			if (!student) {
				return c.json({ success: false, error: "Student not found" }, 404);
			}

			return c.json({ success: true, data: student });
		} catch (error) {
			console.error("Error fetching student:", error);
			return c.json({ success: false, error: "Failed to fetch student" }, 500);
		}
	}

	async create(c: Context) {
		try {
			const data = await c.req.json();

			if (!data.name || !data.email) {
				return c.json(
					{ success: false, error: "Name and email are required" },
					400,
				);
			}

			// Check if email already exists
			const existing = await this.service.findByEmail(data.email);
			if (existing) {
				return c.json({ success: false, error: "Email already exists" }, 409);
			}

			const student = await this.service.create(data);

			return c.json({ success: true, data: student }, 201);
		} catch (error) {
			console.error("Error creating student:", error);
			return c.json({ success: false, error: "Failed to create student" }, 500);
		}
	}

	async update(c: Context) {
		try {
			const id = c.req.param("id");
			const data = await c.req.json();

			const student = await this.service.update(id, data);

			if (!student) {
				return c.json({ success: false, error: "Student not found" }, 404);
			}

			return c.json({ success: true, data: student });
		} catch (error) {
			console.error("Error updating student:", error);
			return c.json({ success: false, error: "Failed to update student" }, 500);
		}
	}

	async delete(c: Context) {
		try {
			const id = c.req.param("id");

			const student = await this.service.delete(id);

			if (!student) {
				return c.json({ success: false, error: "Student not found" }, 404);
			}

			return c.json({ success: true, message: "Student deleted successfully" });
		} catch (error) {
			console.error("Error deleting student:", error);
			return c.json({ success: false, error: "Failed to delete student" }, 500);
		}
	}

	async searchByEmail(c: Context) {
		try {
			const query = c.req.query("q");

			if (!query) {
				return c.json(
					{ success: false, error: "Search query is required" },
					400,
				);
			}

			const students = await this.service.searchByEmail(query);

			return c.json({
				success: true,
				data: students,
				count: students.length,
			});
		} catch (error) {
			console.error("Error searching students:", error);
			return c.json(
				{ success: false, error: "Failed to search students" },
				500,
			);
		}
	}

	async getByTallySubmissionId(c: Context) {
		try {
			const { tallyFormSubmissionId } = await c.req.json();

			if (!tallyFormSubmissionId) {
				return c.json(
					{ success: false, error: "Tally form submission ID is required" },
					400,
				);
			}

			const student = await this.service.findByTallySubmissionId(
				tallyFormSubmissionId,
			);

			if (!student) {
				return c.json({ success: false, error: "Student not found" }, 404);
			}

			return c.json({
				success: true,
				data: student,
			});
		} catch (error) {
			console.error("Error getting student by Tally ID:", error);
			return c.json(
				{ success: false, error: "Failed to retrieve student" },
				500,
			);
		}
	}
}
