"use server";

import { format, parseISO } from "date-fns";
import { z } from "zod";

import { sendRescheduleApprovedEmail } from "@/lib/email";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";

const inputSchema = z.object({
	requestId: z.string().uuid(),
	adminNotes: z.string().optional(),
});

export const approveRescheduleRequest = actionClient
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
					user:user!students_user_id_fkey (
						email
					)
				)
			`,
			)
			.eq("id", parsedInput.requestId)
			.single();

		if (fetchError || !request) {
			return { success: false, error: "Request not found" };
		}

		if (request.status !== "pending" && request.status !== "rejected") {
			return {
				success: false,
				error: "Only pending or rejected requests can be approved",
			};
		}

		// 2. Update status to 'approved' and add notes if provided
		const { error: updateError } = await supabase
			.from("reschedule_requests")
			.update({
				status: "approved",
				teacher_notes: parsedInput.adminNotes || null,
				updated_at: new Date().toISOString(),
			})
			.eq("id", parsedInput.requestId);

		if (updateError) {
			console.error("Error approving reschedule request:", updateError);
			return { success: false, error: "Failed to approve request" };
		}

		// 3. Send email notification to student
		// Note: Supabase returns arrays for joins, so we need to get the first item
		const student = Array.isArray(request.student)
			? request.student[0]
			: request.student;
		const user = student?.user
			? Array.isArray(student.user)
				? student.user[0]
				: student.user
			: null;
		const studentEmail = user?.email;

		if (studentEmail) {
			const studentName = student?.first_name || student?.full_name || "Student";
			const originalDate = parseISO(request.original_class_date);

			try {
				await sendRescheduleApprovedEmail({
					recipientEmail: studentEmail,
					studentName,
					originalClassDate: format(originalDate, "EEEE, MMMM d, yyyy"),
					originalClassTime: format(originalDate, "h:mm a"),
					proposedDatetime: request.proposed_datetime,
					teacherNotes: parsedInput.adminNotes,
				});
			} catch (emailError) {
				// Log but don't fail the action if email fails
				console.error("Failed to send approval email:", emailError);
			}
		}

		return { success: true };
	});
