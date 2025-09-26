"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const createTouchpointSchema = z.object({
	student_id: z.string().uuid(),
	channel: z.enum(["sms", "call", "whatsapp", "email"]),
	type: z.enum(["inbound", "outbound"]),
	message: z.string().min(1),
	source: z.enum([
		"manual",
		"automated",
		"openphone",
		"gmail",
		"whatsapp_business",
		"webhook",
	]),
	occurred_at: z.string(),
	automated_follow_up_id: z.string().uuid().nullable(),
});

export const createTouchpoint = actionClient
	.inputSchema(createTouchpointSchema)
	.action(async ({ parsedInput }) => {
		const supabase = await createClient();

		// Create the touchpoint
		const { data, error } = await supabase
			.from("touchpoints")
			.insert({
				student_id: parsedInput.student_id,
				channel: parsedInput.channel,
				type: parsedInput.type,
				message: parsedInput.message,
				source: parsedInput.source,
				occurred_at: parsedInput.occurred_at,
				automated_follow_up_id: parsedInput.automated_follow_up_id,
				created_at: new Date().toISOString(),
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating touchpoint:", error);
			throw new Error("Failed to create touchpoint");
		}

		// Revalidate relevant paths
		revalidatePath("/admin/automation/touchpoints");
		revalidatePath(`/admin/students/${parsedInput.student_id}`);

		return { success: true, data };
	});
