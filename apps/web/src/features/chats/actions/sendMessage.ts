"use server";

// TODO: Re-enable RBAC imports after testing
import { requireAuth } from "@/lib/rbac-middleware";
// import { isAdmin } from "@/lib/rbac-middleware";
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

const sendMessageSchema = z
	.object({
		cohortId: z.string().uuid(),
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

export const sendMessage = actionClient
	.inputSchema(sendMessageSchema)
	.action(async ({ parsedInput: input }) => {
		const session = await requireAuth();
		const supabase = await createClient();

		// Insert message into messages table
		console.log("🔵 Attempting to create message:", {
			user_id: session.user.id,
			content: input.content || null,
			attachments: input.attachments?.length || 0,
			cohortId: input.cohortId,
		});

		const { data: message, error: messageError } = await supabase
			.from("messages")
			.insert({
				user_id: session.user.id,
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
			// Link message to cohort
			const { error: cohortMessageError } = await supabase
				.from("cohort_messages")
				.insert({
					message_id: message.id,
					cohort_id: input.cohortId,
				});

			if (cohortMessageError) {
				throw new Error(
					`Failed to link message to cohort: ${cohortMessageError.message}`,
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
							// Continue anyway - file is still accessible from temp location
						} else {
							console.log("✅ File moved:", att.fileName);
						}
					}
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
