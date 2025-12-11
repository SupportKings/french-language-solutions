"use client";

import { createClient } from "@/lib/supabase/client";

import type { AttachmentMetadata } from "../types";

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

function getFileType(mimeType: string): "image" | "document" {
	if (ALLOWED_TYPES.image.includes(mimeType)) return "image";
	if (ALLOWED_TYPES.document.includes(mimeType)) return "document";
	throw new Error(`Unsupported file type: ${mimeType}`);
}

/**
 * Upload a file directly to Supabase storage from the client
 * This bypasses Next.js Server Action body size limits
 */
export async function uploadFileToStorage(
	file: File,
	userId: string,
): Promise<AttachmentMetadata> {
	const supabase = createClient();

	// Validate file type
	const fileType = getFileType(file.type);
	const maxSize = SIZE_LIMITS[fileType];

	// Validate file size
	if (file.size > maxSize) {
		throw new Error(
			`File too large. Maximum size for ${fileType}s is ${maxSize / (1024 * 1024)}MB`,
		);
	}

	// Generate unique filename
	const timestamp = Date.now();
	const randomString = Math.random().toString(36).substring(2, 8);
	const fileExtension = file.name.split(".").pop() || "";
	const fileName = `${timestamp}-${randomString}.${fileExtension}`;

	// Upload to temp folder
	const filePath = `${userId}/temp/${fileName}`;

	const { data, error } = await supabase.storage
		.from("chat-attachments")
		.upload(filePath, file, {
			cacheControl: "3600",
			upsert: false,
		});

	if (error) {
		console.error("Upload error:", error);
		throw new Error(`Failed to upload file: ${error.message}`);
	}

	// Get public URL
	const {
		data: { publicUrl },
	} = supabase.storage.from("chat-attachments").getPublicUrl(data.path);

	return {
		fileName: file.name,
		fileUrl: publicUrl,
		fileType,
		fileSize: file.size,
		storagePath: data.path,
	};
}
