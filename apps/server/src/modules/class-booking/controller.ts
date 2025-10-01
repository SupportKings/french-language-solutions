import type { Context } from "hono";
import { ClassBookingService } from "./service";

export class ClassBookingController {
	private service: ClassBookingService;

	constructor() {
		this.service = new ClassBookingService();
	}

	async getAvailableBeginnerCohorts(c: Context) {
		try {
			// Can optionally pass level code as query param or use default "a0"
			const levelCode = c.req.query("levelCode") || "a0";

			const cohorts = await this.service.getAvailableCohorts(levelCode);

			return c.json({
				success: true,
				cohorts: cohorts,
				count: cohorts.length,
			});
		} catch (error) {
			console.error("Error getting available cohorts:", error);
			return c.json(
				{
					success: false,
					error: "Failed to retrieve available cohorts",
				},
				500,
			);
		}
	}

	async processAbandonedEnrollments(c: Context) {
		try {
			const result = await this.service.processAbandonedEnrollments();

			return c.json({
				success: true,
				processed: result.processedCount,
				details: result.details,
			});
		} catch (error) {
			console.error("Error processing abandoned enrollments:", error);
			return c.json(
				{
					success: false,
					error: "Failed to process abandoned enrollments",
				},
				500,
			);
		}
	}

	/**
	 * Get Stripe payment URL for an enrollment
	 * Returns the Stripe signup link with client reference ID
	 */
	async getPaymentUrl(c: Context) {
		try {
			const enrollmentId = c.req.param("enrollmentId");

			if (!enrollmentId) {
				return c.json(
					{
						success: false,
						error: "Enrollment ID is required",
					},
					400,
				);
			}

			const result = await this.service.getPaymentUrl(enrollmentId);

			if (!result.success) {
				return c.json(
					{
						success: false,
						error: result.error,
					},
					400,
				);
			}

			return c.json({
				success: true,
				enrollment_id: enrollmentId,
				payment_url: result.paymentUrl,
			});
		} catch (error) {
			console.error("Error getting payment URL:", error);
			return c.json(
				{
					success: false,
					error: "Failed to generate payment URL",
				},
				500,
			);
		}
	}
}
