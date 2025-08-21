import { z } from "zod";

export const sequenceMessageSchema = z.object({
	id: z.string().uuid(),
	sequence_id: z.string().uuid(),
	step_index: z.number(),
	status: z.enum(["active", "disabled"]),
	time_delay_hours: z.number(),
	message_content: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
});

export const sequenceSchema = z.object({
	id: z.string().uuid(),
	display_name: z.string(),
	subject: z.string(),
	first_follow_up_delay_minutes: z.number(),
	created_at: z.string(),
	updated_at: z.string(),
	// Relations
	template_follow_up_messages: z.array(sequenceMessageSchema).optional(),
	_count: z.object({
		automated_follow_ups: z.number(),
	}).optional(),
});

export type Sequence = z.infer<typeof sequenceSchema>;
export type SequenceMessage = z.infer<typeof sequenceMessageSchema>;

export const sequenceQuerySchema = z.object({
	search: z.string().optional(),
	page: z.number().int().positive().default(1),
	limit: z.number().int().positive().default(10),
});

export type SequenceQuery = z.infer<typeof sequenceQuerySchema>;