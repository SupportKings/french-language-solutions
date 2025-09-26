"use server";

import { actionClient } from "@/lib/safe-action";

import { z } from "zod";

const finalizeSetupSchema = z.object({
	cohortId: z.string().uuid(),
});

export const finalizeSetup = actionClient
	.inputSchema(finalizeSetupSchema)
	.outputSchema(
		z.object({
			success: z.boolean(),
			message: z.string(),
		}),
	)
	.action(async ({ parsedInput }) => {
		const { cohortId } = parsedInput;

		// Get the server URL from environment variables
		const serverUrl =
			process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

		try {
			const response = await fetch(`${serverUrl}/api/cohorts/finalize-setup`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					cohort_id: cohortId,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to finalize cohort setup");
			}

			return {
				success: true,
				message: data.message || "Cohort setup finalized successfully",
			};
		} catch (error) {
			console.error("Error finalizing cohort setup:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to finalize cohort setup";

			return {
				success: false,
				message: errorMessage,
			};
		}
	});
