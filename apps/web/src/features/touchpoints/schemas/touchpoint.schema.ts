import { z } from "zod";

export const touchpointSchema = z.object({
	id: z.string().uuid(),
	student_id: z.string().uuid(),
	channel: z.enum(["sms", "call", "whatsapp", "email"]),
	type: z.enum(["inbound", "outbound"]),
	message: z.string(),
	source: z.enum([
		"manual",
		"automated",
		"openphone",
		"gmail",
		"whatsapp_business",
		"webhook",
	]),
	automated_follow_up_id: z.string().uuid().nullable(),
	external_id: z.string().nullable(),
	external_metadata: z.string().nullable(),
	occurred_at: z.string(),
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
	automated_follow_ups: z
		.object({
			id: z.string(),
			status: z.string(),
			template_follow_up_sequences: z
				.object({
					display_name: z.string(),
				})
				.optional(),
		})
		.optional(),
});

export type Touchpoint = z.infer<typeof touchpointSchema>;

export const touchpointQuerySchema = z.object({
	search: z.string().optional(),
	channel: z.array(z.enum(["sms", "call", "whatsapp", "email"])).optional(),
	type: z.array(z.enum(["inbound", "outbound"])).optional(),
	source: z
		.array(
			z.enum([
				"manual",
				"automated",
				"openphone",
				"gmail",
				"whatsapp_business",
				"webhook",
			]),
		)
		.optional(),
	page: z.number().int().positive().default(1),
	limit: z.number().int().positive().default(20),
});

export type TouchpointQuery = z.infer<typeof touchpointQuerySchema>;
