import type { Context } from "hono";
import { z } from "zod";
import { CohortService } from "./service";

const finalizeSetupSchema = z.object({
	cohort_id: z.string().uuid(),
});

export class CohortController {
	private cohortService: CohortService;

	constructor() {
		this.cohortService = new CohortService();
	}

	/**
	 * Get all attendees for a cohort
	 * Returns array of email addresses including students and teachers
	 *
	 * Path parameter:
	 * - cohortId: string (UUID) - The cohort ID
	 */
	async getAttendees(c: Context) {
		try {
			const cohortId = c.req.param("cohortId");

			if (!cohortId) {
				return c.json({ success: false, error: "Cohort ID is required" }, 400);
			}

			const attendees = await this.cohortService.getAttendees(cohortId);

			return c.json({
				success: true,
				cohort_id: cohortId,
				attendees,
				count: attendees.length,
			});
		} catch (error) {
			console.error("Error fetching cohort attendees:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			return c.json(
				{
					success: false,
					error: "Failed to fetch attendees",
					message: errorMessage,
				},
				500,
			);
		}
	}

	/**
	 * Finalize cohort setup by creating Google Calendar events via Make.com
	 *
	 * Request body:
	 * - cohort_id: string (UUID) - The cohort to finalize
	 *
	 * This endpoint will:
	 * 1. Validate that cohort has a start date
	 * 2. Prepare Google Calendar event data for all weekly sessions
	 * 3. Send webhook to Make.com to create recurring events
	 * 4. Update cohort setup_finalized status on success
	 */
	async finalizeSetup(c: Context) {
		try {
			// Parse and validate request body
			const body = await c.req.json();
			const validatedData = finalizeSetupSchema.parse(body);

			// Process the finalization
			const result = await this.cohortService.finalizeSetup(
				validatedData.cohort_id,
			);

			if (!result.success) {
				return c.json(
					{
						success: false,
						error: result.message,
					},
					400,
				);
			}

			return c.json({
				success: true,
				message: result.message,
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

	/**
	 * Automatically create class records for tomorrow's weekly sessions
	 *
	 * This endpoint will:
	 * 1. Find all cohorts with setup_finalized = true and cohort_status != 'class_ended'
	 * 2. Filter cohorts that have weekly sessions scheduled for tomorrow
	 * 3. Create class records for each matching weekly session
	 * 4. Return count of classes created
	 *
	 * Returns:
	 * {
	 *   "success": true,
	 *   "message": "Successfully created 5 classes for tomorrow",
	 *   "classesCreated": 5
	 * }
	 */
	async createTomorrowClasses(c: Context) {
		try {
			const result = await this.cohortService.createClassesForTomorrow();

			return c.json({
				success: result.success,
				message: result.message,
				classesCreated: result.classesCreated,
			});
		} catch (error) {
			console.error("Error creating tomorrow's classes:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			return c.json(
				{
					success: false,
					error: "Failed to create classes",
					message: errorMessage,
				},
				500,
			);
		}
	}
}
