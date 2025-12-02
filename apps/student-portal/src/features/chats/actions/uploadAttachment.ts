"use server";
import { requireAuth } from "@/lib/auth";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";

import { z } from "zod";
import { zfd } from "zod-form-data";

/**
 * Generic file upload action for chat attachments
 * This action is message-type agnostic - works for cohort messages, direct messages, etc.
 * It only handles file validation and storage upload, no message-specific logic.
 */

const schema = zfd.formData({
	file: zfd.file(),
});

// File size limits (in bytes)
const SIZE_LIMITS = {
	image: 5 * 1024 * 1024, // 5MB
	document: 10 * 1024 * 1024, // 10MB
};

// Allowed MIME types
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

/**
 * Determine file type based on MIME type
 */
function getFileType(mimeType: string): "image" | "document" {
	if (ALLOWED_TYPES.image.includes(mimeType)) {
		return "image";
	}
	if (ALLOWED_TYPES.document.includes(mimeType)) {
		return "document";
	}
	throw new Error(`Unsupported file type: ${mimeType}`);
}

export const uploadChatAttachment = actionClient
	.inputSchema(schema)
	.action(async ({ parsedInput: input }) => {
		const user = await requireAuth();
		const supabase = await createClient();

		const file = input.file as File;

		// Validate file type
		let fileType: "image" | "document";
		try {
			fileType = getFileType(file.type);
		} catch (error) {
			throw new Error(
				"File type not supported. Allowed types: images (PNG, JPG, GIF, WEBP) and documents (PDF, DOC, DOCX, TXT, XLS, XLSX)",
			);
		}

		// Validate file size
		const maxSize = SIZE_LIMITS[fileType];
		if (file.size > maxSize) {
			throw new Error(
				`File too large. Maximum size for ${fileType}s is ${maxSize / (1024 * 1024)}MB`,
			);
		}

		// Generate unique filename
		const fileExt = file.name.split(".").pop();
		const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
		const filePath = `${user.id}/temp/${fileName}`;

		console.log("📤 Uploading file:", {
			originalName: file.name,
			type: fileType,
			size: file.size,
			path: filePath,
		});

		// Upload to Supabase Storage
		const { data, error } = await supabase.storage
			.from("chat-attachments")
			.upload(filePath, file, {
				cacheControl: "3600",
				upsert: false,
			});

		if (error) {
			console.error("❌ Upload failed:", error);
			throw new Error(`Failed to upload file: ${error.message}`);
		}

		// Get public URL
		const {
			data: { publicUrl },
		} = supabase.storage.from("chat-attachments").getPublicUrl(data.path);

		console.log("✅ Upload successful:", {
			fileName: file.name,
			url: publicUrl,
		});

		return {
			success: true,
			data: {
				fileName: file.name,
				fileUrl: publicUrl,
				fileType,
				fileSize: file.size,
				storagePath: data.path,
			},
		};
	});
