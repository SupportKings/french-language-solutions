"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";

import { z } from "zod";
import type { AttachmentMetadata } from "../types";

const attachmentSchema = z.object({
	fileName: z.string(),
	fileUrl: z.string(),
	fileType: z.enum(["image", "document"]),
	fileSize: z.number(),
	storagePath: z.string().optional(),
});

const editMessageSchema = z
	.object({
		messageId: z.string(),
		content: z.string().nullable().optional(),
		attachmentsToAdd: z.array(attachmentSchema).optional(),
		attachmentsToRemove: z.array(z.string()).optional(),
	})
	.refine(
		(data) => {
			// Message must have content OR attachments will remain after edit
			// We can't validate attachments here, but we ensure content exists if provided
			return data.content !== null && data.content !== undefined
				? data.content.trim().length > 0
				: true;
		},
		{ message: "Message must have content or attachments" },
	);

export const editMessage = actionClient
	.inputSchema(editMessageSchema)
	.action(async ({ parsedInput: input }) => {
		const supabase = await createClient();

		// Get current user using Better Auth
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			throw new Error("Not authenticated");
		}

		// Check if message belongs to user and get current attachments
		const { data: message, error: fetchError } = await supabase
			.from("messages")
			.select(
				`
				user_id,
				message_attachments(id, file_name, file_url, file_type, file_size)
			`,
			)
			.eq("id", input.messageId)
			.single();

		if (fetchError || !message) {
			throw new Error("Message not found");
		}

		if (message.user_id !== session.user.id) {
			throw new Error("You can only edit your own messages");
		}

		const currentAttachments = (message as any).message_attachments || [];

		// Validate that message will have content OR attachments after edit
		const remainingAttachmentsCount =
			currentAttachments.length -
			(input.attachmentsToRemove?.length || 0) +
			(input.attachmentsToAdd?.length || 0);

		const hasContent = input.content && input.content.trim().length > 0;
		const willHaveAttachments = remainingAttachmentsCount > 0;

		if (!hasContent && !willHaveAttachments) {
			throw new Error("Message must have content or attachments");
		}

		try {
			// 1. Remove attachments if specified
			if (input.attachmentsToRemove && input.attachmentsToRemove.length > 0) {
				// Get attachment details before deleting
				const attachmentsToDelete = currentAttachments.filter((att: any) =>
					input.attachmentsToRemove?.includes(att.id),
				);

				// Delete from database
				const { error: deleteError } = await supabase
					.from("message_attachments")
					.delete()
					.in("id", input.attachmentsToRemove);

				if (deleteError) {
					throw new Error(
						`Failed to remove attachments: ${deleteError.message}`,
					);
				}

				// Delete from storage
				for (const att of attachmentsToDelete) {
					const storagePath = `${session.user.id}/${input.messageId}/${att.file_name}`;
					await supabase.storage.from("chat-attachments").remove([storagePath]);
				}
			}

			// 2. Add new attachments if specified
			if (input.attachmentsToAdd && input.attachmentsToAdd.length > 0) {
				const attachmentsToInsert = input.attachmentsToAdd.map((att) => ({
					message_id: input.messageId,
					file_name: att.fileName,
					file_url: att.fileUrl,
					file_type: att.fileType,
					file_size: att.fileSize,
				}));

				const { error: insertError } = await supabase
					.from("message_attachments")
					.insert(attachmentsToInsert);

				if (insertError) {
					throw new Error(`Failed to add attachments: ${insertError.message}`);
				}

				// Move files from temp to message folder
				for (const att of input.attachmentsToAdd) {
					if (att.storagePath?.includes("/temp/")) {
						const newPath = att.storagePath.replace(
							"/temp/",
							`/${input.messageId}/`,
						);
						const { error: moveError } = await supabase.storage
							.from("chat-attachments")
							.move(att.storagePath, newPath);

						if (moveError) {
							console.error("Failed to move file:", moveError);
						}
					}
				}
			}

			// 3. Update message content and edited_at
			const { error: updateError } = await supabase
				.from("messages")
				.update({
					content: input.content || null,
					edited_at: new Date().toISOString(),
				})
				.eq("id", input.messageId);

			if (updateError) {
				throw new Error(`Failed to edit message: ${updateError.message}`);
			}

			revalidatePath("/admin/chats");

			return { success: true };
		} catch (error) {
			// Rollback: Clean up any uploaded files on error
			if (input.attachmentsToAdd && input.attachmentsToAdd.length > 0) {
				for (const att of input.attachmentsToAdd) {
					if (att.storagePath) {
						await supabase.storage
							.from("chat-attachments")
							.remove([att.storagePath]);
					}
				}
			}
			throw error;
		}
	});
