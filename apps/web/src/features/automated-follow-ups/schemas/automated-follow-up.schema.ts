import { z } from "zod";

export const automatedFollowUpSchema = z.object({
	id: z.string().uuid(),
	student_id: z.string().uuid(),
	sequence_id: z.string().uuid(),
	status: z.enum(["activated", "ongoing", "answer_received", "disabled"]),
	started_at: z.string(),
	last_message_sent_at: z.string().nullable(),
	completed_at: z.string().nullable(),
	created_at: z.string(),
	updated_at: z.string(),
	// Relations
	students: z
		.object({
			id: z.string(),
			full_name: z.string(),
			email: z.string().nullable(),
			mobile_phone_number: z.string().nullable(),
		})
		.optional(),
	sequence: z
		.object({
			id: z.string(),
			display_name: z.string(),
			subject: z.string(),
		})
		.optional(),
});

export type AutomatedFollowUp = z.infer<typeof automatedFollowUpSchema>;

export const automatedFollowUpQuerySchema = z.object({
	search: z.string().optional(),
	status: z
		.array(z.enum(["activated", "ongoing", "answer_received", "disabled"]))
		.optional(),
	sequence_id: z.array(z.string()).optional(),
	page: z.number().int().positive().default(1),
	limit: z.number().int().positive().default(20),
});

export type AutomatedFollowUpQuery = z.infer<
	typeof automatedFollowUpQuerySchema
>;
