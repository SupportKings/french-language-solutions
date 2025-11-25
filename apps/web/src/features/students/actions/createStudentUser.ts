"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { siteConfig } from "@/siteConfig";

import { StudentInviteEmail } from "@workspace/emails/emails/student-invite";
import { returnValidationErrors } from "next-safe-action";
import { Resend } from "resend";
import { z } from "zod";

const inputSchema = z.object({
	studentId: z.string(),
	email: z.string().email("Invalid email address"),
	sendInvite: z.boolean().default(true),
});

function generateSecurePassword(): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
	let password = "";
	for (let i = 0; i < 16; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return password;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const createStudentUser = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			const session = await auth.api.getSession({
				headers: await headers(),
			});

			if (!session?.user) {
				return returnValidationErrors(inputSchema, {
					_errors: ["You must be logged in to create student users."],
				});
			}

			const headersList = await headers();
			const studentResponse = await fetch(
				`${process.env.NEXT_PUBLIC_APP_URL}/api/students/${parsedInput.studentId}`,
				{
					headers: {
						"Content-Type": "application/json",
						Cookie: headersList.get("cookie") || "",
					},
				},
			);

			if (!studentResponse.ok) {
				return returnValidationErrors(inputSchema, {
					_errors: ["Student not found."],
				});
			}

			const student = await studentResponse.json();

			if (student.user_id) {
				return returnValidationErrors(inputSchema, {
					_errors: ["This student already has a user account."],
				});
			}

			const fullName = student.full_name || "Student";
			const password = generateSecurePassword();

			const createUserResponse = await auth.api
				.createUser({
					body: {
						email: parsedInput.email,
						password,
						name: fullName,
					},
				})
				.catch(async (createUserError: unknown) => {
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

			const updateResponse = await fetch(
				`${process.env.NEXT_PUBLIC_APP_URL}/api/students/${parsedInput.studentId}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Cookie: headersList.get("cookie") || "",
					},
					body: JSON.stringify({
						user_id: newUser.id,
					}),
				},
			);

			if (!updateResponse.ok) {
				const errorText = await updateResponse.text();
				console.error("Failed to update student with user_id:", errorText);
				throw new Error("Failed to link user to student");
			}

			try {
				const supabase = await createClient();
				const { error } = await supabase
					.from("user")
					.update({ role: "student" })
					.eq("id", newUser.id);

				if (error) {
					console.error("Failed to set student role:", error);
				}
			} catch (roleError) {
				console.error("Failed to update role in database:", roleError);
			}

			if (parsedInput.sendInvite) {
				try {
					const inviteUrl =
						process.env.STUDENT_PORTAL_URL ||
						"https://student.frenchlanguagesolutions.com/";

					const emailResponse = await resend.emails.send({
						from: "French Language Solutions <portal@frenchlanguagesolutions.com>",
						to: [parsedInput.email],
						subject: `Bienvenue! Welcome to ${siteConfig.name} Student Portal 🎉`,
						react: StudentInviteEmail({
							studentName: fullName,
							inviteUrl,
							companyName: siteConfig.name,
							inviterName: session.user.name || undefined,
						}),
					});

					if (emailResponse.error) {
						console.error("Resend API error:", emailResponse.error);
					}
				} catch (emailError) {
					console.error("Exception while sending email:", emailError);
				}
			}

			return {
				success: true,
				message: parsedInput.sendInvite
					? "Student account created and invitation sent successfully"
					: "Student account created successfully",
				userId: newUser.id,
			};
		} catch (error) {
			console.error("Unexpected error in createStudentUser:", error);

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
