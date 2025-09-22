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

	async triggerNextMessages(c: Context) {
		try {
			// Parse optional request body
			const body = await c.req.json().catch(() => ({}));
			const { webhookUrl } = body;

			// Use provided webhook URL or fallback to environment variable
			const makeWebhookUrl = webhookUrl || process.env.MAKE_WEBHOOK_URL;

			if (!makeWebhookUrl) {
				return c.json(
					{ 
						success: false, 
						error: "Webhook URL not configured. Set MAKE_WEBHOOK_URL environment variable or provide webhookUrl in request body" 
					}, 
					400
				);
			}

			// Call service to find and trigger webhooks
			const result = await this.service.triggerNextMessages(makeWebhookUrl);

			return c.json(result);
		} catch (error) {
			console.error("Error triggering next messages:", error);
			return c.json({ 
				success: false, 
				error: "Failed to trigger next messages",
				details: error instanceof Error ? error.message : "Unknown error"
			}, 500);
		}
	}

	async checkRecentEngagementsToStop(c: Context) {
		try {
			// Parse optional request body for custom time range (default 1 hour)
			const body = await c.req.json().catch(() => ({}));
			const { hoursBack = 1 } = body;

			// Call service to check recent engagements and stop follow-ups
			const result = await this.service.checkRecentEngagementsToStop(hoursBack);

			return c.json(result);
		} catch (error) {
			console.error("Error checking recent engagements:", error);
			return c.json({ 
				success: false, 
				error: "Failed to check recent engagements",
				details: error instanceof Error ? error.message : "Unknown error"
			}, 500);
		}
	}
}