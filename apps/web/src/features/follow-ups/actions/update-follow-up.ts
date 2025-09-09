"use server";

import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { automatedFollowUpsApi } from "../api/follow-ups.api";

const updateAutomatedFollowUpSchema = z.object({
	id: z.string().min(1),
	status: z
		.enum(["activated", "ongoing", "answer_received", "disabled"])
		.optional(),
});

export const updateAutomatedFollowUp = actionClient
	.inputSchema(updateAutomatedFollowUpSchema)
	.action(async ({ parsedInput }) => {
		try {
			const { id, ...data } = parsedInput;
			const followUp = await automatedFollowUpsApi.update(id, data);
			return { success: true, data: followUp };
		} catch (error) {
			console.error("Failed to update automated follow-up:", error);
			return {
				success: false,
				error: "Failed to update automated follow-up",
			};
		}
	});