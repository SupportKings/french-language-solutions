import type { Context } from "hono";
import { z } from "zod";
import { TeacherService } from "./service";
import type { GetAvailableTeachersRequest } from "./types";

const getAvailableTeachersSchema = z.object({
	format: z.enum(["online", "in_person"]),
	duration_minutes: z.number().positive().int(),
	day_of_week: z.string().min(1),
	student_id: z.string().uuid(),
	session_structure: z.enum(["single", "double"]),
});

export class TeacherController {
	private teacherService: TeacherService;

	constructor() {
		this.teacherService = new TeacherService();
	}

	/**
	 * Get available teachers for one-to-one (private) classes
	 *
	 * Request body:
	 * - format: "online" | "in_person" - Class delivery format
	 * - duration_minutes: number - Duration of each class session (e.g., 60, 90, 120)
	 * - day_of_week: string - Day for the class (accepts: "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" or full names like "Monday")
	 * - student_id: string (UUID) - ID of the student requesting the class
	 * - session_structure: "single" | "double" - Whether student wants one or two sessions per week
	 *
	 * Returns: Array of available teachers (id, first_name, last_name, google_calendar_id only)
	 */
	async getAvailableTeachers(c: Context) {
		try {
			// Parse and validate request body
			const body = await c.req.json();
			const validatedData = getAvailableTeachersSchema.parse(body);

			// Get available teachers
			const availableTeachers = await this.teacherService.getAvailableTeachers(
				validatedData as GetAvailableTeachersRequest,
			);

			return c.json({
				success: true,
				data: availableTeachers,
				count: availableTeachers.length,
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				return c.json(
					{
						success: false,
						error: "Validation error",
						details: error.issues.map((e) => ({
							field: e.path.join("."),
							message: e.message,
						})),
					},
					400,
				);
			}

			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";

			return c.json(
				{
					success: false,
					error: errorMessage,
				},
				500,
			);
		}
	}
}
