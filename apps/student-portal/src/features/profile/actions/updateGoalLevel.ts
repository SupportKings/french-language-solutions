"use server";

import { z } from "zod";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/serviceRole";
import { getUser } from "@/queries/getUser";

const inputSchema = z.object({
	goalLevelId: z.string().uuid(),
});

export const updateGoalLevelAction = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			const session = await getUser();

			if (!session?.user) {
				return {
					ok: false,
					error: "Unauthorized",
				};
			}

			const supabase = await createClient();

			// Get student ID from user
			const { data: student, error: studentError } = await supabase
				.from("students")
				.select("id")
				.eq("user_id", session.user.id)
				.single();

			if (studentError || !student) {
				return {
					ok: false,
					error: "Student not found",
				};
			}

			// Update goal level
			const { error: updateError } = await supabase
				.from("students")
				.update({ goal_language_level_id: parsedInput.goalLevelId })
				.eq("id", student.id);

			if (updateError) {
				console.error("Update error:", updateError);
				return {
					ok: false,
					error: "Failed to update goal level",
				};
			}

			return {
				ok: true,
			};
		} catch (error) {
			console.error("Update goal level error:", error);
			return {
				ok: false,
				error: "Failed to update goal level",
			};
		}
	});
