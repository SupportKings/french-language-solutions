import type { Context } from "hono";
import { FollowUpService } from "./service";

export class FollowUpController {
	private service: FollowUpService;

	constructor() {
		this.service = new FollowUpService();
	}

	async setFollowUp(c: Context) {
		try {
			const { studentId, sequenceBackendName } = await c.req.json();

			if (!studentId) {
				return c.json({ success: false, error: "Student ID is required" }, 400);
			}

			if (!sequenceBackendName) {
				return c.json({ success: false, error: "Sequence backend name is required" }, 400);
			}

			const result = await this.service.setFollowUp(studentId, sequenceBackendName);

			if (!result.success) {
				return c.json(result, 400);
			}

			return c.json(result);
		} catch (error) {
			console.error("Error setting follow-up:", error);
			return c.json({ success: false, error: "Failed to set follow-up" }, 500);
		}
	}

	async getAllSequences(c: Context) {
		try {
			const sequences = await this.service.getAllSequences();
			
			return c.json({
				success: true,
				data: sequences,
				count: sequences.length
			});
		} catch (error) {
			console.error("Error fetching sequences:", error);
			return c.json({ success: false, error: "Failed to fetch sequences" }, 500);
		}
	}

	async getStudentFollowUps(c: Context) {
		try {
			const studentId = c.req.param("studentId");

			if (!studentId) {
				return c.json({ success: false, error: "Student ID is required" }, 400);
			}

			const followUps = await this.service.getStudentFollowUps(studentId);

			return c.json({
				success: true,
				data: followUps,
				count: followUps.length
			});
		} catch (error) {
			console.error("Error fetching student follow-ups:", error);
			return c.json({ success: false, error: "Failed to fetch student follow-ups" }, 500);
		}
	}

	async advanceFollowUp(c: Context) {
		try {
			const { followUpId } = await c.req.json();

			if (!followUpId) {
				return c.json({ success: false, error: "Follow-up ID is required" }, 400);
			}

			const result = await this.service.advanceFollowUp(followUpId);

			if (!result.success) {
				return c.json(result, 400);
			}

			return c.json(result);
		} catch (error) {
			console.error("Error advancing follow-up:", error);
			return c.json({ success: false, error: "Failed to advance follow-up" }, 500);
		}
	}

	async stopFollowUps(c: Context) {
		try {
			const { studentId } = await c.req.json();

			if (!studentId) {
				return c.json({ success: false, error: "Student ID is required" }, 400);
			}

			const result = await this.service.stopAllFollowUps(studentId);

			if (!result.success) {
				return c.json(result, 400);
			}

			return c.json(result);
		} catch (error) {
			console.error("Error stopping follow-ups:", error);
			return c.json({ success: false, error: "Failed to stop follow-ups" }, 500);
		}
	}
}