"use server";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/lib/supabase/serviceRole";

import { zfd } from "zod-form-data";

const inputSchema = zfd.formData({
	image: zfd.file(),
});

export const uploadProfilePictureAction = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			const supabase = await createClient();

			// Generate a unique filename
			const fileExt = parsedInput.image.name.split(".").pop();
			const fileName = `${Date.now()}-${Math.random()
				.toString(36)
				.substring(2)}.${fileExt}`;

			// Upload file to Supabase storage
			const { data, error } = await supabase.storage
				.from("profiles")
				.upload(fileName, parsedInput.image, {
					cacheControl: "3600",
					upsert: false,
				});

			if (error) {
				console.error("Upload error:", error);
				return {
					ok: false,
					error: "Failed to upload image",
				};
			}

			// Get the public URL
			const {
				data: { publicUrl },
			} = supabase.storage.from("profiles").getPublicUrl(fileName);

			return {
				ok: true,
				imageUrl: publicUrl,
			};
		} catch (error) {
			console.error("Upload error:", error);
			return {
				ok: false,
				error: "Failed to upload image",
			};
		}
	});
