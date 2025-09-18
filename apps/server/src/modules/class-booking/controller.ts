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
				count: cohorts.length
			});

		} catch (error) {
			console.error("Error getting available cohorts:", error);
			return c.json(
				{
					success: false,
					error: "Failed to retrieve available cohorts"
				},
				500
			);
		}
	}

}