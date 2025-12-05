"use server";

import { z } from "zod";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/serviceRole";
import { getUser } from "@/queries/getUser";

const inputSchema = z.object({
	requestId: z.string().uuid(),
});

export const cancelRescheduleRequest = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			const session = await getUser();

			if (!session?.user) {
				return { success: false, error: "Unauthorized" };
			}

			const supabase = await createClient();

			// Get student ID
			const { data: student, error: studentError } = await supabase
				.from("students")
				.select("id")
				.eq("user_id", session.user.id)
				.single();

			if (studentError || !student) {
				return { success: false, error: "Student not found" };
			}

			// Verify the request exists, belongs to the student, and is pending
			const { data: request, error: requestError } = await supabase
				.from("reschedule_requests")
				.select("id, student_id, status")
				.eq("id", parsedInput.requestId)
				.single();

			if (requestError || !request) {
				return { success: false, error: "Request not found" };
			}

			if (request.student_id !== student.id) {
				return { success: false, error: "Unauthorized to cancel this request" };
			}

			if (request.status !== "pending") {
				return { success: false, error: "Only pending requests can be cancelled" };
			}

			// Update the status to cancelled
			const { error: updateError } = await supabase
				.from("reschedule_requests")
				.update({
					status: "cancelled",
					updated_at: new Date().toISOString(),
				})
				.eq("id", parsedInput.requestId);

			if (updateError) {
				console.error("Error cancelling reschedule request:", updateError);
				return { success: false, error: "Failed to cancel request" };
			}

			return { success: true };
		} catch (error) {
			console.error("Cancel reschedule request error:", error);
			return { success: false, error: "An unexpected error occurred" };
		}
	});
