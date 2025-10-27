"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";

import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

const checklistUpdateSchema = z.object({
	enrollmentId: z.string().uuid("Invalid enrollment id"),
	checklistType: z.enum(["enrollment", "transition", "offboarding"]),
	itemKey: z.string().min(1, "Item key is required"),
	updates: z.object({
		completed: z.boolean().optional(),
		last_class_date: z.string().nullable().optional(),
		old_teacher_notified: z.boolean().optional(),
		new_teacher_notified: z.boolean().optional(),
		review_link: z.string().nullable().optional(),
	}),
});

export const updateChecklistAction = actionClient
	.inputSchema(checklistUpdateSchema)
	.action(async ({ parsedInput }) => {
		const { enrollmentId, checklistType, itemKey, updates } = parsedInput;

		try {
			// Get current user from Better Auth
			const session = await auth.api.getSession({
				headers: await headers(),
			});

			if (!session?.user) {
				return returnValidationErrors(checklistUpdateSchema, {
					_errors: ["Not authenticated. Please refresh the page and try again."],
				});
			}

			const userId = session.user.id;
			const supabase = await createClient();

			// Get current enrollment with checklist
			const { data: enrollment, error: fetchError } = await supabase
				.from("enrollments")
				.select(
					"id, enrollment_checklist, transition_checklist, offboarding_checklist, status",
				)
				.eq("id", enrollmentId)
				.single();

			if (fetchError || !enrollment) {
				console.error("Enrollment fetch error:", fetchError);
				return returnValidationErrors(checklistUpdateSchema, {
					_errors: [
						`Enrollment not found: ${fetchError?.message || "Unknown error"}`,
					],
				});
			}

			// Determine which checklist to update
			const checklistField =
				checklistType === "enrollment"
					? "enrollment_checklist"
					: checklistType === "transition"
						? "transition_checklist"
						: "offboarding_checklist";

			// Validate that the checklist type matches the enrollment status
			if (checklistType === "transition" && enrollment.status !== "transitioning") {
				return returnValidationErrors(checklistUpdateSchema, {
					_errors: [
						"Cannot update transition checklist when enrollment status is not 'transitioning'",
					],
				});
			}
			if (checklistType === "offboarding" && enrollment.status !== "offboarding") {
				return returnValidationErrors(checklistUpdateSchema, {
					_errors: [
						"Cannot update offboarding checklist when enrollment status is not 'offboarding'",
					],
				});
			}

			// Get current checklist or initialize empty object
			const currentChecklist =
				(enrollment[checklistField] as Record<string, any>) || {};

			// Get current item or initialize
			const currentItem = currentChecklist[itemKey] || {
				completed: false,
				completed_at: null,
				completed_by: null,
				required: true,
			};

			// Build updated item
			const updatedItem = {
				...currentItem,
			};

			// Update completed status if provided
			if (updates.completed !== undefined) {
				updatedItem.completed = updates.completed;
				updatedItem.completed_at = updates.completed
					? new Date().toISOString()
					: null;
				updatedItem.completed_by = updates.completed ? userId : null;
			}

			// Update additional fields
			if (updates.last_class_date !== undefined) {
				updatedItem.last_class_date = updates.last_class_date;
			}
			if (updates.old_teacher_notified !== undefined) {
				updatedItem.old_teacher_notified = updates.old_teacher_notified;
				// Auto-complete if both teachers notified
				if (
					updates.old_teacher_notified &&
					updatedItem.new_teacher_notified
				) {
					updatedItem.completed = true;
					updatedItem.completed_at = new Date().toISOString();
					updatedItem.completed_by = userId;
				}
			}
			if (updates.new_teacher_notified !== undefined) {
				updatedItem.new_teacher_notified = updates.new_teacher_notified;
				// Auto-complete if both teachers notified
				if (
					updates.new_teacher_notified &&
					updatedItem.old_teacher_notified
				) {
					updatedItem.completed = true;
					updatedItem.completed_at = new Date().toISOString();
					updatedItem.completed_by = userId;
				}
			}
			if (updates.review_link !== undefined) {
				updatedItem.review_link = updates.review_link;
			}

			// Update checklist
			const updatedChecklist = {
				...currentChecklist,
				[itemKey]: updatedItem,
			};

			// Save to database
			const { error: updateError } = await supabase
				.from("enrollments")
				.update({
					[checklistField]: updatedChecklist,
					updated_at: new Date().toISOString(),
				})
				.eq("id", enrollmentId);

			if (updateError) {
				console.error("Error updating checklist:", updateError);
				console.error("Update data:", {
					checklistField,
					updatedChecklist,
					enrollmentId,
				});
				return returnValidationErrors(checklistUpdateSchema, {
					_errors: [
						`Failed to update checklist: ${updateError.message || "Unknown error"}`,
					],
				});
			}

			// Revalidate paths
			revalidatePath("/admin/students/enrollments");
			revalidatePath(`/admin/students/enrollments/${enrollmentId}`);

			return {
				success: true,
				data: {
					success: "Checklist updated successfully",
				},
			};
		} catch (error) {
			console.error("Unexpected error in updateChecklist:", error);
			return returnValidationErrors(checklistUpdateSchema, {
				_errors: ["Failed to update checklist. Please try again."],
			});
		}
	});
