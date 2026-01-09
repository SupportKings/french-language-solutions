"use server";

import { requireAuth } from "@/lib/rbac-middleware";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const SIZE_LIMITS = {
	image: 5 * 1024 * 1024, // 5MB
	document: 10 * 1024 * 1024, // 10MB
};

const ALLOWED_TYPES = {
	image: ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"],
	document: [
		"application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"text/plain",
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	],
};

function getFileType(mimeType: string): "image" | "document" | null {
	if (ALLOWED_TYPES.image.includes(mimeType)) return "image";
	if (ALLOWED_TYPES.document.includes(mimeType)) return "document";
	return null;
}

const schema = z.object({
	fileName: z.string().min(1),
	fileSize: z.number().positive(),
	mimeType: z.string().min(1),
});

export const createSignedUploadUrl = actionClient
	.inputSchema(schema)
	.action(async ({ parsedInput: input }) => {
		const session = await requireAuth();
		const supabase = await createClient();

		const { fileName, fileSize, mimeType } = input;

		// Validate file type
		const fileType = getFileType(mimeType);
		if (!fileType) {
			throw new Error(
				"File type not supported. Allowed types: images (PNG, JPG, GIF, WEBP) and documents (PDF, DOC, DOCX, TXT, XLS, XLSX)",
			);
		}

		// Validate file size
		const maxSize = SIZE_LIMITS[fileType];
		if (fileSize > maxSize) {
			throw new Error(
				`File too large. Maximum size for ${fileType}s is ${maxSize / (1024 * 1024)}MB`,
			);
		}

		// Generate unique filename
		const fileExt = fileName.split(".").pop();
		const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
		const filePath = `${session.user.id}/temp/${uniqueFileName}`;

		// Create signed upload URL (valid for 1 hour)
		const { data, error } = await supabase.storage
			.from("chat-attachments")
			.createSignedUploadUrl(filePath);

		if (error) {
			console.error("Failed to create signed upload URL:", error);
			throw new Error("Failed to prepare upload. Please try again.");
		}

		// Get the public URL for the file (will be valid after upload)
		const {
			data: { publicUrl },
		} = supabase.storage.from("chat-attachments").getPublicUrl(filePath);

		return {
			signedUrl: data.signedUrl,
			token: data.token,
			path: filePath,
			publicUrl,
			fileType,
		};
	});
