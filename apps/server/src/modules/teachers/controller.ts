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
			console.log("📥 Teachers available endpoint called");
			console.log("📝 Request method:", c.req.method);
			console.log("📝 Request URL:", c.req.url);

			// Parse and validate request body
			const body = await c.req.json();
			console.log("📝 Request body:", JSON.stringify(body));

			const validatedData = getAvailableTeachersSchema.parse(body);
			console.log("✅ Validation passed:", validatedData);

			// Get available teachers
			const availableTeachers = await this.teacherService.getAvailableTeachers(
				validatedData as GetAvailableTeachersRequest,
			);

			console.log(`✅ Found ${availableTeachers.length} available teachers`);

			return c.json({
				success: true,
				data: availableTeachers,
				count: availableTeachers.length,
			});
		} catch (error) {
			console.error("❌ Error in getAvailableTeachers:", error);

			if (error instanceof z.ZodError) {
				console.error("❌ Validation errors:", error.issues);
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

			console.error("❌ Error message:", errorMessage);

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
