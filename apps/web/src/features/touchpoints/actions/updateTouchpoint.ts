"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateTouchpointSchema = z.object({
	id: z.string().uuid(),
	student_id: z.string().uuid().optional(),
	channel: z.enum(["sms", "call", "whatsapp", "email"]).optional(),
	type: z.enum(["inbound", "outbound"]).optional(),
	message: z.string().min(1).optional(),
	source: z
		.enum([
			"manual",
			"automated",
			"openphone",
			"gmail",
			"whatsapp_business",
			"webhook",
		])
		.optional(),
	occurred_at: z.string().optional(),
	automated_follow_up_id: z.string().uuid().nullable().optional(),
});

export const updateTouchpoint = actionClient
	.inputSchema(updateTouchpointSchema)
	.action(async ({ input }) => {
		const { id, ...updateData } = input;
		const supabase = await createClient();

		// Remove undefined values
		const cleanData = Object.entries(updateData).reduce((acc, [key, value]) => {
			if (value !== undefined) {
				acc[key] = value;
			}
			return acc;
		}, {} as any);

		// Update the touchpoint
		const { data, error } = await supabase
			.from("touchpoints")
			.update({
				...cleanData,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
			.select(
				`
				*,
				students (
					id,
					full_name,
					email,
					mobile_phone_number
				),
				automated_follow_ups (
					id,
					status,
					template_follow_up_sequences (
						display_name
					)
				)
			`,
			)
			.single();

		if (error) {
			console.error("Error updating touchpoint:", error);
			throw new Error("Failed to update touchpoint");
		}

		// Revalidate relevant paths
		revalidatePath("/admin/automation/touchpoints");
		revalidatePath(`/admin/automation/touchpoints/${id}`);
		if (data.student_id) {
			revalidatePath(`/admin/students/${data.student_id}`);
		}

		return { success: true, data };
	});
