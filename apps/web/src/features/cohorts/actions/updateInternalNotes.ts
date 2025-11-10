"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

const schema = z.object({
	cohortId: z.string().uuid(),
	internalNotes: z.any(),
});

export const updateCohortInternalNotes = actionClient
	.inputSchema(schema)
	.action(async ({ parsedInput }) => {
		const supabase = await createClient();

		const { error } = await supabase
			.from("cohorts")
			.update({
				internal_notes: parsedInput.internalNotes,
				updated_at: new Date().toISOString(),
			})
			.eq("id", parsedInput.cohortId);

		if (error) {
			console.error("Error updating cohort internal notes:", error);
			throw new Error("Failed to update internal notes");
		}

		return { success: true };
	});
