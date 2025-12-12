"use server";

import { actionClient } from "@/lib/safe-action";

import { z } from "zod";
import { automatedFollowUpsApi } from "../api/follow-ups.api";

const createAutomatedFollowUpSchema = z.object({
	student_id: z.string().min(1, "Student is required"),
	sequence_id: z.string().min(1, "Sequence is required"),
	start_immediately: z.boolean().optional().default(true),
});

export const createAutomatedFollowUp = actionClient
	.inputSchema(createAutomatedFollowUpSchema)
	.action(async ({ parsedInput }) => {
		try {
			const followUp = await automatedFollowUpsApi.create({
				student_id: parsedInput.student_id,
				sequence_id: parsedInput.sequence_id,
				status: parsedInput.start_immediately ? "activated" : "disabled",
			});
			return { data: followUp };
		} catch (error) {
			console.error("Failed to create automated follow-up:", error);
			return {
				serverError:
					error instanceof Error
						? error.message
						: "Failed to create automated follow-up",
			};
		}
	});
