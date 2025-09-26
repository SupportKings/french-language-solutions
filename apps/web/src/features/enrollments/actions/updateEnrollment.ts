"use server";

import { revalidatePath } from "next/cache";

import { actionClient } from "@/lib/safe-action";

import { createClient } from "@/utils/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const enrollmentUpdateSchema = z
	.object({
		id: z.string().uuid("Invalid enrollment id"),
		status: z
			.enum([
				"declined_contract",
				"dropped_out",
				"interested",
				"beginner_form_filled",
				"contract_abandoned",
				"contract_signed",
				"payment_abandoned",
				"paid",
				"welcome_package_sent",
			])
			.optional(),
		studentId: z.string().uuid("Invalid student id").optional(),
		studentData: z
			.object({
				full_name: z.string().trim().min(1, "Full name is required").optional(),
				email: z.string().email().optional().nullable(),
				mobile_phone_number: z.string().optional().nullable(),
				city: z.string().optional().nullable(),
				communication_channel: z.enum(["sms_email", "email", "sms"]).optional(),
			})
			.optional(),
	})
	.superRefine((val, ctx) => {
		const hasId = !!val.studentId;
		const hasData = !!val.studentData;
		if (hasId !== hasData) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["studentId"],
				message: "studentId and studentData must be provided together",
			});
		}
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
				.select("id, student_id")
				.eq("id", id)
				.single();

			if (fetchError || !existingEnrollment) {
				return returnValidationErrors(enrollmentUpdateSchema, {
					_errors: ["Enrollment not found"],
				});
			}

			if (studentId && existingEnrollment.student_id !== studentId) {
				return returnValidationErrors(enrollmentUpdateSchema, {
					studentId: {
						_errors: ["studentId does not belong to this enrollment"],
					},
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
					const { data: emailConflict, error: emailConflictError } =
						await supabase
							.from("students")
							.select("id")
							.eq("email", studentData.email)
							.neq("id", studentId)
							.limit(1)
							.maybeSingle();

					if (emailConflictError) {
						return returnValidationErrors(enrollmentUpdateSchema, {
							_errors: [
								"Failed to check for email conflict. Please try again.",
							],
						});
					}

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

				const normalizedStudentData = {
					...studentData,
					full_name: studentData.full_name?.trim(),
					email: studentData.email?.trim() || null,
					mobile_phone_number: studentData.mobile_phone_number?.trim() || null,
					city: studentData.city?.trim() || null,
				};

				const { error: studentUpdateError } = await supabase
					.from("students")
					.update({
						...normalizedStudentData,
						updated_at: new Date().toISOString(),
					})
					.eq("id", studentId);

				if (studentUpdateError) {
					console.error("Error updating student:", studentUpdateError);
					return returnValidationErrors(enrollmentUpdateSchema, {
						_errors: [
							"Failed to update student information. Please try again.",
						],
					});
				}
			}

			// 4. Revalidate relevant paths
			revalidatePath("/admin/enrollments");
			revalidatePath(`/admin/students/enrollments/${id}`);
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
