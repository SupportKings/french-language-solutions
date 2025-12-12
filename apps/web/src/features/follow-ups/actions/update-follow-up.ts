"use server";

import { actionClient } from "@/lib/safe-action";

import { z } from "zod";
import { automatedFollowUpsApi } from "../api/follow-ups.api";

const updateAutomatedFollowUpSchema = z
	.object({
		id: z.string().min(1),
		status: z
			.enum(["activated", "ongoing", "answer_received", "disabled"])
			.optional(),
	})
	.refine(
		(obj) => {
			const keys = Object.keys(obj) as Array<keyof typeof obj>;
			return keys.some((k) => k !== "id" && obj[k] !== undefined);
		},
		{ message: "At least one field to update must be provided" },
	);

export const updateAutomatedFollowUp = actionClient
	.inputSchema(updateAutomatedFollowUpSchema)
	.action(async ({ parsedInput }) => {
		try {
			const { id, ...data } = parsedInput;
			const followUp = await automatedFollowUpsApi.update(id, data);
			return { data: followUp };
		} catch (error) {
			console.error("Failed to update automated follow-up:", error);
			return {
				serverError: "Failed to update automated follow-up",
			};
		}
	});
