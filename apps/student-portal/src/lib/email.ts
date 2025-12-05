import { RescheduleRequestEmail } from "@workspace/emails/emails/reschedule-request";
import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendRescheduleRequestNotificationParams {
	teacherEmail: string;
	teacherName: string;
	studentName: string;
	cohortName: string;
	originalClassDate: string;
	originalClassTime: string;
	proposedDatetime: string;
	reason?: string;
}

/**
 * Send reschedule request notification email to teacher
 */
export async function sendRescheduleRequestNotification({
	teacherEmail,
	teacherName,
	studentName,
	cohortName,
	originalClassDate,
	originalClassTime,
	proposedDatetime,
	reason,
}: SendRescheduleRequestNotificationParams) {
	try {
		const emailResponse = await resend.emails.send({
			from: "French Language Solutions <portal@frenchlanguagesolutions.com>",
			to: [teacherEmail],
			subject: `Reschedule Request from ${studentName}`,
			react: RescheduleRequestEmail({
				studentName,
				teacherName,
				cohortName,
				originalClassDate,
				originalClassTime,
				proposedDatetime,
				reason,
			}),
		});

		if (emailResponse.error) {
			console.error(
				`[Email] Failed to send reschedule request notification to ${teacherEmail}:`,
				emailResponse.error,
			);
		}

		return emailResponse;
	} catch (error) {
		console.error(
			`[Email] Exception while sending reschedule request notification to ${teacherEmail}:`,
			error,
		);
		// Don't throw - we don't want email failure to fail the request
		return { error };
	}
}
