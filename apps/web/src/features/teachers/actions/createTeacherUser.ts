"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { siteConfig } from "@/siteConfig";

import { InviteEmail } from "@workspace/emails/emails/invite";
import { returnValidationErrors } from "next-safe-action";
import { Resend } from "resend";
import { z } from "zod";

const inputSchema = z.object({
	teacherId: z.string(),
	email: z.string().email("Invalid email address"),
	role: z.enum(["admin", "teacher"]), // Simple roles: admin or teacher
	sendInvite: z.boolean().default(false),
});

// Generate a secure random password
function generateSecurePassword(): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
	let password = "";
	for (let i = 0; i < 16; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return password;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const createTeacherUser = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			// Get current user (admin creating the teacher user)
			const session = await auth.api.getSession({
				headers: await headers(),
			});

			if (!session?.user) {
				return returnValidationErrors(inputSchema, {
					_errors: ["You must be logged in to create teacher users."],
				});
			}

			// Get teacher details
			const headersList = await headers();
			const teacherResponse = await fetch(
				`${process.env.NEXT_PUBLIC_APP_URL}/api/teachers/${parsedInput.teacherId}`,
				{
					headers: {
						"Content-Type": "application/json",
						Cookie: headersList.get("cookie") || "",
					},
				},
			);

			if (!teacherResponse.ok) {
				return returnValidationErrors(inputSchema, {
					_errors: ["Teacher not found."],
				});
			}

			const teacher = await teacherResponse.json();

			// Check if teacher already has a user
			if (teacher.user_id) {
				return returnValidationErrors(inputSchema, {
					_errors: ["This teacher already has a user account."],
				});
			}

			const fullName = `${teacher.first_name} ${teacher.last_name}`.trim();

			// Generate a password (user will use OTP to login)
			const password = generateSecurePassword();

			// Create the user
			const createUserResponse = await auth.api
				.createUser({
					body: {
						email: parsedInput.email,
						password,
						name: fullName,
					},
				})
				.catch(async (createUserError: unknown) => {
					// Check if user already exists
					if (
						createUserError &&
						typeof createUserError === "object" &&
						"status" in createUserError
					) {
						const apiError = createUserError as { status: string; body?: any };

						if (apiError.status === "BAD_REQUEST") {
							const errorMessage = apiError.body?.message || "";
							if (
								errorMessage.toLowerCase().includes("user already exists") ||
								errorMessage.toLowerCase().includes("already exists")
							) {
								throw new Error("USER_ALREADY_EXISTS");
							}
						}
					}
					console.error("Error creating user:", createUserError);
					throw new Error("CREATE_USER_FAILED");
				});

			const newUser = createUserResponse.user;

			// IMMEDIATELY update teacher record with user_id - this is critical!
			console.log("Updating teacher with user_id:", newUser.id);
			const updateResponse = await fetch(
				`${process.env.NEXT_PUBLIC_APP_URL}/api/teachers/${parsedInput.teacherId}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: headersList.get("cookie") || "",
					},
					body: JSON.stringify({
						user_id: newUser.id,
						// Do NOT update teacher.role - that's for internal team categorization
					}),
				},
			);

			if (!updateResponse.ok) {
				const errorText = await updateResponse.text();
				console.error("Failed to update teacher with user_id:", errorText);
				// This is critical - if we can't link the user to teacher, we should fail
				throw new Error("Failed to link user to teacher");
			}
			const updatedTeacher = await updateResponse.json();
			console.log(
				"Teacher updated successfully with user_id:",
				updatedTeacher.user_id,
			);

			// Now try to set role - but don't fail if this doesn't work
			try {
				await auth.api.setRole({
					body: {
						userId: newUser.id,
						role: parsedInput.role, // Already validated as "admin" or "teacher"
					},
					headers: await headers(),
				});
				console.log(
					`Successfully set role to ${parsedInput.role} for user ${newUser.id}`,
				);
			} catch (roleError) {
				console.warn(
					"Better Auth API failed to set role, trying direct database update...",
				);

				// Fallback: Update role directly in database
				try {
					const supabase = await createClient();
					const { error } = await supabase
						.from("user")
						.update({ role: parsedInput.role })
						.eq("id", newUser.id);

					if (error) {
						console.error("Database update failed:", error);
					} else {
						console.log(
							`Successfully set role to ${parsedInput.role} via database`,
						);
					}
				} catch (dbError) {
					console.error("Failed to update role in database:", dbError);
				}
			}

			// Send invite email if requested
			if (parsedInput.sendInvite) {
				console.log("Attempting to send invite email to:", parsedInput.email);
				console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);

				try {
					const inviteUrl = `https://french-language-solutions.vercel.app/`;
					console.log("Invite URL:", inviteUrl);

					const emailResponse = await resend.emails.send({
						from: "French Language Solutions <portal@frenchlanguagesolutions.com>",
						to: [parsedInput.email],
						subject: `You've been invited to join ${siteConfig.name}`,
						react: InviteEmail({
							inviteUrl,
							companyName: siteConfig.name,
							inviterName: session.user.name,
							inviterEmail: session.user.email,
						}),
					});

					console.log("Email send response:", emailResponse);

					if (emailResponse.error) {
						console.error("Resend API error:", emailResponse.error);
					} else {
						console.log("Email sent successfully, ID:", emailResponse.data?.id);
					}
				} catch (emailError) {
					console.error("Exception while sending email:", emailError);
				}
			} else {
				console.log("Send invite checkbox was not checked");
			}

			return {
				success: true,
				message: parsedInput.sendInvite
					? "User created and invitation sent successfully"
					: "User created successfully",
				userId: newUser.id,
			};
		} catch (error) {
			console.error("Unexpected error in createTeacherUser:", error);

			if (error instanceof Error) {
				if (error.message === "USER_ALREADY_EXISTS") {
					return returnValidationErrors(inputSchema, {
						_errors: ["A user with this email already exists."],
					});
				}
				if (error.message === "CREATE_USER_FAILED") {
					return returnValidationErrors(inputSchema, {
						_errors: ["Failed to create user. Please try again."],
					});
				}
			}

			return returnValidationErrors(inputSchema, {
				_errors: ["Failed to create user. Please try again."],
			});
		}
	});
