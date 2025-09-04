"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { getUser } from "@/queries/getUser";

import { z } from "zod";

const deleteEnrollmentSchema = z.object({
	id: z.string(),
});

export const deleteEnrollment = actionClient
	.inputSchema(deleteEnrollmentSchema)
	.action(async ({ parsedInput }) => {
		const { id } = parsedInput;

		const user = await getUser();
		if (!user) {
			throw new Error("Authentication required");
		}

		const supabase = await createClient();

		const { error } = await supabase.from("enrollments").delete().eq("id", id);

		if (error) {
			throw new Error(`Failed to delete enrollment: ${error.message}`);
		}

		// Revalidate paths
		revalidatePath("/admin/enrollments");
		revalidatePath("/admin/students");

		return { success: true };
	});
