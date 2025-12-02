"use server";
import { requireAuth } from "@/lib/auth";

import { sendDirectMessageNotificationsBatch } from "@/lib/email";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";

import { z } from "zod";

const messageAttachmentSchema = z.object({
	fileName: z.string().min(1),
	fileUrl: z.string().url(),
	fileType: z.enum(["image", "document"]),
	fileSize: z.number().positive(),
	storagePath: z.string().optional(),
});

const sendDirectMessageSchema = z
	.object({
		conversationId: z.string().uuid(),
		content: z.string().max(5000).optional(),
		attachments: z.array(messageAttachmentSchema).max(10).optional(),
	})
	.refine(
		(data) =>
			(data.content && data.content.trim().length > 0) ||
			(data.attachments && data.attachments.length > 0),
		{
			message: "Message must have either content or at least one attachment",
		},
	);

/**
 * Send a direct message in a conversation
 * Also triggers email notifications based on recipient roles and preferences
 */
export const sendDirectMessage = actionClient
	.inputSchema(sendDirectMessageSchema)
	.action(async ({ parsedInput: input }) => {
		const user = await requireAuth();
		const supabase = await createClient();

		// Verify user is a participant in this conversation
		const { data: participant } = await supabase
			.from("conversation_participants")
			.select("id")
			.eq("conversation_id", input.conversationId)
			.eq("user_id", user.id)
			.maybeSingle();

		if (!participant) {
			throw new Error(
				"FORBIDDEN: You don't have access to send messages in this conversation",
			);
		}

		// Insert message into messages table
		console.log("🔵 Attempting to create direct message:", {
			user_id: user.id,
			content: input.content || null,
			attachments: input.attachments?.length || 0,
			conversationId: input.conversationId,
		});

		const { data: message, error: messageError } = await supabase
			.from("messages")
			.insert({
				user_id: user.id,
				content: input.content || null,
			})
			.select()
			.single();

		if (messageError || !message) {
			console.error("❌ Failed to create message:", messageError);
			throw new Error(`Failed to create message: ${messageError?.message}`);
		}

		console.log("✅ Message created successfully:", message.id);

		try {
			// Link message to conversation
			const { error: directMessageError } = await supabase
				.from("direct_messages")
				.insert({
					message_id: message.id,
					conversation_id: input.conversationId,
				});

			if (directMessageError) {
				throw new Error(
					`Failed to link message to conversation: ${directMessageError.message}`,
				);
			}

			// Insert attachments if any
			if (input.attachments && input.attachments.length > 0) {
				console.log("📎 Inserting attachments:", input.attachments.length);

				const attachmentsToInsert = input.attachments.map((att) => ({
					message_id: message.id,
					file_name: att.fileName,
					file_url: att.fileUrl,
					file_type: att.fileType,
					file_size: att.fileSize,
				}));

				const { error: attachmentsError } = await supabase
					.from("message_attachments")
					.insert(attachmentsToInsert);

				if (attachmentsError) {
					throw new Error(
						`Failed to insert attachments: ${attachmentsError.message}`,
					);
				}

				// Move files from temp to message folder
				console.log("📂 Moving files from temp to message folder");
				for (const att of input.attachments) {
					if (att.storagePath && att.storagePath.includes("/temp/")) {
						const newPath = att.storagePath.replace(
							"/temp/",
							`/${message.id}/`,
						);

						const { error: moveError } = await supabase.storage
							.from("chat-attachments")
							.move(att.storagePath, newPath);

						if (moveError) {
							console.warn("⚠️ Failed to move file:", {
								from: att.storagePath,
								to: newPath,
								error: moveError,
							});
						} else {
							console.log("✅ File moved:", att.fileName);
						}
					}
				}
			}

			// Send email notifications to participants (if they have opted in)
			console.log("📧 Sending email notifications...");

			// Fetch all participants (excluding the sender)
			const { data: participantsData } = await supabase
				.from("conversation_participants")
				.select(
					`
					user_id,
					user:user!conversation_participants_user_id_fkey(
						id,
						name,
						email,
						role
					)
				`,
				)
				.eq("conversation_id", input.conversationId)
				.neq("user_id", user.id);

			if (participantsData && participantsData.length > 0) {
				// Get sender's name
				const { data: senderData } = await supabase
					.from("user")
					.select("name")
					.eq("id", user.id)
					.single();

				const senderName = senderData?.name || "A team member";

				// Create a preview of the message
				const messagePreview =
					input.content?.substring(0, 100) ||
					`Sent ${input.attachments?.length || 0} attachment(s)`;

				// Build conversation URL
				const baseUrl =
					process.env.STUDENT_PORTAL_URL ||
					process.env.NEXT_PUBLIC_APP_URL ||
					"https://student.frenchlanguagesolutions.com";
				const conversationUrl = `${baseUrl}/chats/${input.conversationId}`;

				// Filter participants based on email preferences
				const recipientsToNotify: Array<{ email: string; name: string }> = [];

				for (const participant of participantsData) {
					const user = (participant as any).user;

					// Check email notification preferences for all users
					const { data: preferences } = await supabase
						.from("chat_notification_preferences")
						.select("email_notifications_enabled")
						.eq("user_id", user.id)
						.maybeSingle();

					// Only send email if user has opted in (or preference not set and user is teacher/admin)
					const shouldNotify =
						(preferences?.email_notifications_enabled === true || preferences !== null);

					if (shouldNotify) {
						recipientsToNotify.push({
							email: user.email,
							name: user.name || "User",
						});
					}
				}

				// Send emails in batch
				if (recipientsToNotify.length > 0) {
					// Fire and forget - don't block message sending on email delivery
					sendDirectMessageNotificationsBatch(
						recipientsToNotify,
						senderName,
						messagePreview,
						conversationUrl,
					).catch((error) => {
						console.error("❌ Failed to send email notifications:", error);
					});

					console.log(
						`📧 Email notifications queued for ${recipientsToNotify.length} recipient(s)`,
					);
				} else {
					console.log("📧 No recipients to notify");
				}
			}

			return {
				success: true,
				data: {
					id: message.id,
					content: message.content,
					attachmentsCount: input.attachments?.length || 0,
				},
			};
		} catch (error: any) {
			console.error("❌ Error in message creation flow:", error);

			// Rollback - delete the message
			await supabase.from("messages").delete().eq("id", message.id);

			// Clean up uploaded files
			if (input.attachments) {
				console.log("🧹 Cleaning up uploaded files");
				for (const att of input.attachments) {
					if (att.storagePath) {
						await supabase.storage
							.from("chat-attachments")
							.remove([att.storagePath]);
					}
				}
			}

			throw new Error(`Failed to send message: ${error.message}`);
		}
	});
