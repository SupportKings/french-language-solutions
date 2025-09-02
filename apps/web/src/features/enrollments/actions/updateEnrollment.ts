"use server";

import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { returnValidationErrors } from "next-safe-action";

const enrollmentUpdateSchema = z.object({
	id: z.string(),
	status: z.enum([
		"declined_contract",
		"dropped_out",
		"interested",
		"beginner_form_filled",
		"contract_abandoned",
		"contract_signed",
		"payment_abandoned",
		"paid",
		"welcome_package_sent"
	]).optional(),
	studentId: z.string().optional(),
	studentData: z.object({
		full_name: z.string(),
		email: z.string().email().optional().nullable(),
		mobile_phone_number: z.string().optional().nullable(),
		city: z.string().optional().nullable(),
		communication_channel: z.enum(["sms_email", "email", "sms"]),
	}).optional(),
});

export const updateEnrollmentAction = actionClient
	.inputSchema(enrollmentUpdateSchema)
	.action(async ({ parsedInput }) => {
		const { id, status, studentId, studentData } = parsedInput;

		try {
			const supabase = await createClient();

			// 1. Check if enrollment exists
			const { data: existingEnrollment, error: fetchError } = await supabase
				.from("enrollments")
				.select("id")
				.eq("id", id)
				.single();

			if (fetchError || !existingEnrollment) {
				return returnValidationErrors(enrollmentUpdateSchema, {
					_errors: ["Enrollment not found"],
				});
			}

			// 2. Update enrollment status if provided
			if (status !== undefined) {
				const { error: updateError } = await supabase
					.from("enrollments")
					.update({
						status,
						updated_at: new Date().toISOString(),
					})
					.eq("id", id);

				if (updateError) {
					console.error("Error updating enrollment:", updateError);
					return returnValidationErrors(enrollmentUpdateSchema, {
						_errors: ["Failed to update enrollment status. Please try again."],
					});
				}
			}

			// 3. Update student data if provided
			if (studentId && studentData) {
				// Check if email is being updated and if it conflicts with another student
				if (studentData.email) {
					const { data: emailConflict } = await supabase
						.from("students")
						.select("id")
						.eq("email", studentData.email)
						.neq("id", studentId)
						.single();

					if (emailConflict) {
						return returnValidationErrors(enrollmentUpdateSchema, {
							studentData: {
								email: {
									_errors: ["Student with this email already exists"],
								},
							},
						});
					}
				}

				const { error: studentUpdateError } = await supabase
					.from("students")
					.update({
						...studentData,
						updated_at: new Date().toISOString(),
					})
					.eq("id", studentId);

				if (studentUpdateError) {
					console.error("Error updating student:", studentUpdateError);
					return returnValidationErrors(enrollmentUpdateSchema, {
						_errors: ["Failed to update student information. Please try again."],
					});
				}
			}

			// 4. Revalidate relevant paths
			revalidatePath("/admin/enrollments");
			revalidatePath(`/admin/students/enrollment/${id}`);
			revalidatePath("/admin/students");

			return {
				success: true,
				data: {
					success: "Enrollment updated successfully",
				},
			};
		} catch (error) {
			console.error("Unexpected error in updateEnrollment:", error);

			return returnValidationErrors(enrollmentUpdateSchema, {
				_errors: ["Failed to update enrollment. Please try again."],
			});
		}
	});