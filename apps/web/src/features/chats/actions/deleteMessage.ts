"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";

import { z } from "zod";

const deleteMessageSchema = z.object({
	messageId: z.string(),
});

export const deleteMessage = actionClient
	.inputSchema(deleteMessageSchema)
	.action(async ({ parsedInput: input }) => {
		const supabase = await createClient();

		// Get current user using Better Auth
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			throw new Error("Not authenticated");
		}

		// Check if message belongs to user
		const { data: message, error: fetchError } = await supabase
			.from("messages")
			.select("user_id")
			.eq("id", input.messageId)
			.single();

		if (fetchError || !message) {
			throw new Error("Message not found");
		}

		if (message.user_id !== session.user.id) {
			throw new Error("You can only delete your own messages");
		}

		// Soft delete message
		const { error: deleteError } = await supabase
			.from("messages")
			.update({
				deleted_at: new Date().toISOString(),
			})
			.eq("id", input.messageId);

		if (deleteError) {
			throw new Error(`Failed to delete message: ${deleteError.message}`);
		}

		revalidatePath("/admin/chats");

		return { success: true };
	});
