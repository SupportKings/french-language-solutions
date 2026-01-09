"use client";

import { createSignedUploadUrl } from "../actions/createSignedUploadUrl";
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
 * Upload a file to Supabase storage using a server-generated signed URL.
 * This approach keeps the Supabase client server-side only while still
 * allowing direct uploads to bypass Next.js body size limits.
 */
export async function uploadFileToStorage(
	file: File,
	_userId: string,
): Promise<AttachmentMetadata> {
	// Validate file type locally first for immediate feedback
	const fileType = getFileType(file.type);
	const maxSize = SIZE_LIMITS[fileType];

	if (file.size > maxSize) {
		throw new Error(
			`File too large. Maximum size for ${fileType}s is ${maxSize / (1024 * 1024)}MB`,
		);
	}

	// Get signed upload URL from server
	const result = await createSignedUploadUrl({
		fileName: file.name,
		fileSize: file.size,
		mimeType: file.type,
	});

	if (!result?.data) {
		throw new Error(
			result?.serverError || "Failed to prepare upload. Please try again.",
		);
	}

	const { signedUrl, path, publicUrl } = result.data;

	// Upload file directly to Supabase using the signed URL
	const uploadResponse = await fetch(signedUrl, {
		method: "PUT",
		headers: {
			"Content-Type": file.type,
		},
		body: file,
	});

	if (!uploadResponse.ok) {
		const errorText = await uploadResponse.text();
		console.error("Upload error:", errorText);
		throw new Error("Failed to upload file. Please try again.");
	}

	return {
		fileName: file.name,
		fileUrl: publicUrl,
		fileType,
		fileSize: file.size,
		storagePath: path,
	};
}
