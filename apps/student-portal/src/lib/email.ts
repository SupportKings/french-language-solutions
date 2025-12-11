import { AnnouncementNotificationEmail } from "@workspace/emails/emails/announcement-notification";
import { DirectMessageNotificationEmail } from "@workspace/emails/emails/direct-message-notification";
import { RescheduleRequestEmail } from "@workspace/emails/emails/reschedule-request";
import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendAnnouncementNotificationParams {
	recipientEmail: string;
	recipientName: string;
	announcementTitle: string;
	announcementUrl?: string;
}

/**
 * Send announcement notification email to a single recipient
 * @param params - Email parameters
 * @returns Resend API response
 */
export async function sendAnnouncementNotification({
	recipientEmail,
	recipientName,
	announcementTitle,
	announcementUrl = process.env.STUDENT_PORTAL_URL ||
		process.env.NEXT_PUBLIC_APP_URL ||
		"https://student.frenchlanguagesolutions.com",
}: SendAnnouncementNotificationParams) {
	try {
		const emailResponse = await resend.emails.send({
			from: "French Language Solutions <portal@frenchlanguagesolutions.com>",
			to: [recipientEmail],
			subject: "New Announcement from French Language Solutions",
			react: AnnouncementNotificationEmail({
				studentName: recipientName,
				announcementTitle,
				viewUrl: announcementUrl,
			}),
		});

		if (emailResponse.error) {
			console.error(
				`[Email] Failed to send announcement notification to ${recipientEmail}:`,
				emailResponse.error,
			);
		}

		return emailResponse;
	} catch (error) {
		console.error(
			`[Email] Exception while sending announcement notification to ${recipientEmail}:`,
			error,
		);
		throw error;
	}
}

/**
 * Send announcement notifications to multiple recipients in batch
 * @param recipients - Array of recipient objects
 * @param announcementTitle - Title of the announcement
 * @param announcementUrl - URL to view the announcement
 * @returns Array of results from all email sends
 */
export async function sendAnnouncementNotificationsBatch(
	recipients: Array<{ email: string; name: string }>,
	announcementTitle: string,
	announcementUrl?: string,
) {
	console.log(
		`[Email] Sending announcement notifications to ${recipients.length} recipients`,
	);

	// Send all emails in parallel, but don't fail if some fail
	const results = await Promise.allSettled(
		recipients.map((recipient) =>
			sendAnnouncementNotification({
				recipientEmail: recipient.email,
				recipientName: recipient.name,
				announcementTitle,
				announcementUrl,
			}),
		),
	);

	// Log summary
	const successful = results.filter((r) => r.status === "fulfilled").length;
	const failed = results.filter((r) => r.status === "rejected").length;

	console.log(
		`[Email] Announcement notifications sent: ${successful} successful, ${failed} failed`,
	);

	if (failed > 0) {
		const errors = results
			.filter((r) => r.status === "rejected")
			.map((r) => (r as PromiseRejectedResult).reason);
		console.error("[Email] Failed emails:", errors);
	}

	return results;
}

interface SendDirectMessageNotificationParams {
	recipientEmail: string;
	recipientName: string;
	senderName: string;
	messagePreview: string;
	conversationUrl?: string;
}

/**
 * Send direct message notification email to a single recipient
 * @param params - Email parameters
 * @returns Resend API response
 */
export async function sendDirectMessageNotification({
	recipientEmail,
	recipientName,
	senderName,
	messagePreview,
	conversationUrl = process.env.STUDENT_PORTAL_URL ||
		process.env.NEXT_PUBLIC_APP_URL ||
		"https://student.frenchlanguagesolutions.com/chats",
}: SendDirectMessageNotificationParams) {
	try {
		const preferencesUrl = `${conversationUrl.replace("/chats", "")}/settings`;

		const emailResponse = await resend.emails.send({
			from: "French Language Solutions <portal@frenchlanguagesolutions.com>",
			to: [recipientEmail],
			subject: `New message from ${senderName}`,
			react: DirectMessageNotificationEmail({
				recipientName,
				senderName,
				messagePreview,
				conversationUrl,
				preferencesUrl,
			}),
		});

		if (emailResponse.error) {
			console.error(
				`[Email] Failed to send direct message notification to ${recipientEmail}:`,
				emailResponse.error,
			);
		}

		return emailResponse;
	} catch (error) {
		console.error(
			`[Email] Exception while sending direct message notification to ${recipientEmail}:`,
			error,
		);
		throw error;
	}
}

/**
 * Send direct message notifications to multiple recipients in batch
 * @param recipients - Array of recipient objects with email and name
 * @param senderName - Name of the message sender
 * @param messagePreview - Preview of the message content
 * @param conversationUrl - URL to view the conversation
 * @returns Array of results from all email sends
 */
export async function sendDirectMessageNotificationsBatch(
	recipients: Array<{ email: string; name: string }>,
	senderName: string,
	messagePreview: string,
	conversationUrl?: string,
) {
	console.log(
		`[Email] Sending direct message notifications to ${recipients.length} recipients`,
	);

	// Send all emails in parallel, but don't fail if some fail
	const results = await Promise.allSettled(
		recipients.map((recipient) =>
			sendDirectMessageNotification({
				recipientEmail: recipient.email,
				recipientName: recipient.name,
				senderName,
				messagePreview,
				conversationUrl,
			}),
		),
	);

	// Log summary
	const successful = results.filter((r) => r.status === "fulfilled").length;
	const failed = results.filter((r) => r.status === "rejected").length;

	console.log(
		`[Email] Direct message notifications sent: ${successful} successful, ${failed} failed`,
	);

	if (failed > 0) {
		const errors = results
			.filter((r) => r.status === "rejected")
			.map((r) => (r as PromiseRejectedResult).reason);
		console.error("[Email] Failed emails:", errors);
	}

	return results;
}

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
