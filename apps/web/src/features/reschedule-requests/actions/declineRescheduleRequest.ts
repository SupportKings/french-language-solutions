"use server";

import { format, parseISO } from "date-fns";
import { z } from "zod";

import { sendRescheduleDeclinedEmail } from "@/lib/email";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";

const inputSchema = z.object({
	requestId: z.string().uuid(),
	adminNotes: z.string().optional(),
});

export const declineRescheduleRequest = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		const supabase = await createClient();

		// 1. Fetch request with student and user info for email
		const { data: request, error: fetchError } = await supabase
			.from("reschedule_requests")
			.select(
				`
				id,
				status,
				original_class_date,
				proposed_datetime,
				student:students!reschedule_requests_student_id_fkey (
					id,
					first_name,
					full_name,
					email
				)
			`,
			)
			.eq("id", parsedInput.requestId)
			.single();

		if (fetchError || !request) {
			return { success: false, error: "Request not found" };
		}

		if (request.status !== "pending" && request.status !== "approved") {
			return {
				success: false,
				error: "Only pending or approved requests can be declined",
			};
		}

		// 2. Update status to 'rejected'
		const { error: updateError } = await supabase
			.from("reschedule_requests")
			.update({
				status: "rejected",
				teacher_notes: parsedInput.adminNotes || null,
				updated_at: new Date().toISOString(),
			})
			.eq("id", parsedInput.requestId);

		if (updateError) {
			console.error("Error declining reschedule request:", updateError);
			return { success: false, error: "Failed to decline request" };
		}

		// 3. Send email notification to student
		// Note: Supabase returns arrays for joins, so we need to get the first item
		const student = Array.isArray(request.student)
			? request.student[0]
			: request.student;
		const studentEmail = student?.email;

		if (studentEmail) {
			const studentName = student?.first_name || student?.full_name || "Student";
			const originalDate = parseISO(request.original_class_date);

			try {
				await sendRescheduleDeclinedEmail({
					recipientEmail: studentEmail,
					studentName,
					originalClassDate: format(originalDate, "EEEE, MMMM d, yyyy"),
					originalClassTime: format(originalDate, "h:mm a"),
					proposedDatetime: request.proposed_datetime,
					teacherNotes: parsedInput.adminNotes,
				});
			} catch (emailError) {
				// Log but don't fail the action if email fails
				console.error("Failed to send decline email:", emailError);
			}
		}

		return { success: true };
	});
