"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";

import { z } from "zod";

const schema = z.object({
	file: z.instanceof(File),
	announcementId: z.string().uuid().optional(), // Optional because we might upload before announcement is created
});

export const uploadAttachment = actionClient
	.inputSchema(schema)
	.action(async ({ parsedInput: input }) => {
		const supabase = await createClient();

		const file = input.file;
		const fileExt = file.name.split(".").pop();
		const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
		const filePath = input.announcementId
			? `${input.announcementId}/${fileName}`
			: `temp/${fileName}`;

		// Determine file type
		let fileType: "image" | "video" | "document" = "document";
		if (file.type.startsWith("image/")) {
			fileType = "image";
		} else if (file.type.startsWith("video/")) {
			fileType = "video";
		}

		// Upload to Supabase Storage
		const { data, error } = await supabase.storage
			.from("announcement_attachments")
			.upload(filePath, file, {
				cacheControl: "3600",
				upsert: false,
			});

		if (error) {
			throw new Error(`Failed to upload file: ${error.message}`);
		}

		// Get public URL
		const {
			data: { publicUrl },
		} = supabase.storage
			.from("announcement_attachments")
			.getPublicUrl(data.path);

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
