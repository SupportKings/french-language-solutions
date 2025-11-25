"use server";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { z } from "zod";

const schema = z.object({
	studentId: z.string().uuid(),
	internalNotes: z.any(),
});

export const updateStudentInternalNotes = actionClient
	.inputSchema(schema)
	.action(async ({ parsedInput }) => {
		const supabase = await createClient();

		const { error } = await supabase
			.from("students")
			.update({
				internal_notes: parsedInput.internalNotes,
				updated_at: new Date().toISOString(),
			})
			.eq("id", parsedInput.studentId);

		if (error) {
			console.error("Error updating student internal notes:", error);
			throw new Error("Failed to update internal notes");
		}

		return { success: true };
	});
