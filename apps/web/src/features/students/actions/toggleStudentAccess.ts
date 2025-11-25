"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const revokeSchema = z.object({
	userId: z.string(),
	action: z.literal("revoke"),
	reason: z.string().optional(),
});

const restoreSchema = z.object({
	userId: z.string(),
	action: z.literal("restore"),
});

const inputSchema = z.discriminatedUnion("action", [
	revokeSchema,
	restoreSchema,
]);

export const toggleStudentAccess = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			const session = await auth.api.getSession({
				headers: await headers(),
			});

			if (!session?.user) {
				return returnValidationErrors(inputSchema, {
					_errors: ["You must be logged in to manage student access."],
				});
			}

			const supabase = await createClient();

			if (parsedInput.action === "revoke") {
				// Try Better Auth API first
				try {
					await auth.api.banUser({
						body: {
							userId: parsedInput.userId,
							banReason: parsedInput.reason || "Portal access revoked by admin",
						},
						headers: await headers(),
					});
				} catch (authError) {
					// Fallback to direct database update
					console.warn(
						"Better Auth ban API failed, using database update...",
						authError,
					);

					const { error } = await supabase
						.from("user")
						.update({
							banned: true,
							banReason: parsedInput.reason || "Portal access revoked by admin",
							banExpires: null,
						})
						.eq("id", parsedInput.userId);

					if (error) {
						console.error("Failed to revoke access:", error);
						throw new Error("Failed to revoke access");
					}
				}

				return {
					success: true,
					message: "Student portal access has been revoked.",
				};
			}

			// Restore access (unban)
			try {
				await auth.api.unbanUser({
					body: {
						userId: parsedInput.userId,
					},
					headers: await headers(),
				});
			} catch (authError) {
				// Fallback to direct database update
				console.warn(
					"Better Auth unban API failed, using database update...",
					authError,
				);

				const { error } = await supabase
					.from("user")
					.update({
						banned: false,
						banReason: null,
						banExpires: null,
					})
					.eq("id", parsedInput.userId);

				if (error) {
					console.error("Failed to restore access:", error);
					throw new Error("Failed to restore access");
				}
			}

			return {
				success: true,
				message: "Student portal access has been restored.",
			};
		} catch (error) {
			console.error("Unexpected error in toggleStudentAccess:", error);

			return returnValidationErrors(inputSchema, {
				_errors: ["Failed to update student access. Please try again."],
			});
		}
	});
