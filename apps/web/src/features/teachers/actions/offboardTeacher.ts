"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const inputSchema = z.object({
	teacherId: z.string(),
});

export const offboardTeacher = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			// Get current user (admin performing the offboarding)
			const session = await auth.api.getSession({
				headers: await headers(),
			});

			if (!session?.user) {
				return returnValidationErrors(inputSchema, {
					_errors: ["You must be logged in to offboard teachers."],
				});
			}

			// Get teacher details
			const teacherResponse = await fetch(
				`${process.env.NEXT_PUBLIC_APP_URL}/api/teachers/${parsedInput.teacherId}`,
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (!teacherResponse.ok) {
				return returnValidationErrors(inputSchema, {
					_errors: ["Teacher not found."],
				});
			}

			const teacher = await teacherResponse.json();

			// If teacher has a user account, delete the user
			// The cascade will automatically set teacher.user_id to NULL
			if (teacher.user_id) {
				try {
					const supabase = await createClient();
					const { error } = await supabase
						.from("user")
						.delete()
						.eq("id", teacher.user_id);

					if (error) {
						console.error("Error deleting user:", error);
					}
				} catch (error) {
					console.error("Error deleting user:", error);
					// Continue with offboarding even if deletion fails
				}
			}

			// Update teacher status to offboarded
			const updateResponse = await fetch(
				`${process.env.NEXT_PUBLIC_APP_URL}/api/teachers/${parsedInput.teacherId}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						onboarding_status: "offboarded",
						available_for_booking: false,
						available_for_online_classes: false,
						available_for_in_person_classes: false,
						user_id: null, // Explicitly set to null
					}),
				}
			);

			if (!updateResponse.ok) {
				const errorText = await updateResponse.text();
				console.error("Failed to update teacher status:", errorText);
				return returnValidationErrors(inputSchema, {
					_errors: ["Failed to update teacher status."],
				});
			}

			return {
				success: true,
				message: "Teacher offboarded and user account removed successfully",
			};

		} catch (error) {
			console.error("Unexpected error in offboardTeacher:", error);

			return returnValidationErrors(inputSchema, {
				_errors: ["Failed to offboard teacher. Please try again."],
			});
		}
	});

// This action permanently deletes a teacher record from the database
// Use with caution - this cannot be undone
export const permanentlyDeleteTeacher = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			// Get current user
			const session = await auth.api.getSession({
				headers: await headers(),
			});

			if (!session?.user) {
				return returnValidationErrors(inputSchema, {
					_errors: ["You must be logged in to delete teachers."],
				});
			}

			// Use the DELETE endpoint which permanently deletes the teacher
			const deleteResponse = await fetch(
				`${process.env.NEXT_PUBLIC_APP_URL}/api/teachers/${parsedInput.teacherId}`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (!deleteResponse.ok) {
				const errorData = await deleteResponse.json();
				return returnValidationErrors(inputSchema, {
					_errors: [errorData.error || "Failed to delete teacher."],
				});
			}

			return {
				success: true,
				message: "Teacher and associated user account deleted permanently",
			};

		} catch (error) {
			console.error("Unexpected error in permanentlyDeleteTeacher:", error);

			return returnValidationErrors(inputSchema, {
				_errors: ["Failed to delete teacher. Please try again."],
			});
		}
	});