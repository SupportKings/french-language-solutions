"use server";

import { addHours, addWeeks, format, parseISO } from "date-fns";
import { z } from "zod";

import { sendRescheduleRequestNotification } from "@/lib/email";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/serviceRole";
import { getUser } from "@/queries/getUser";

const inputSchema = z.object({
	cohortId: z.string().uuid(),
	originalClassDate: z.string(), // ISO datetime string
	proposedDatetime: z.string().min(1, "Proposed date/time is required"),
	reason: z.string().optional(),
});

const MAX_REQUESTS_PER_PERIOD = 3;
const PERIOD_WEEKS = 2;
const MIN_HOURS_BEFORE_CLASS = 24;

export const createRescheduleRequest = actionClient
	.inputSchema(inputSchema)
	.action(async ({ parsedInput }) => {
		try {
			const session = await getUser();

			if (!session?.user) {
				return { success: false, error: "Unauthorized" };
			}

			const supabase = await createClient();

			// Get student info
			const { data: student, error: studentError } = await supabase
				.from("students")
				.select("id, full_name, first_name")
				.eq("user_id", session.user.id)
				.single();

			if (studentError || !student) {
				return { success: false, error: "Student not found" };
			}

			// Verify this is a private enrollment for this student and get cohort details
			const { data: enrollment, error: enrollmentError } = await supabase
				.from("enrollments")
				.select(
					`
					id,
					status,
					cohort:cohorts!inner (
						id,
						nickname,
						product:products!inner (
							format,
							display_name
						)
					)
				`,
				)
				.eq("student_id", student.id)
				.eq("cohort_id", parsedInput.cohortId)
				.in("status", ["paid", "welcome_package_sent"])
				.single();

			if (enrollmentError || !enrollment) {
				return { success: false, error: "No active private enrollment found" };
			}

			// Extract cohort data - Supabase returns nested objects
			const cohortData = enrollment.cohort as unknown as {
				id: string;
				nickname: string | null;
				product: { format: string; display_name: string };
			};
			if (!cohortData || cohortData.product?.format !== "private") {
				return {
					success: false,
					error: "Rescheduling is only available for private classes",
				};
			}

			// Validate class is >24 hours away
			const classDate = parseISO(parsedInput.originalClassDate);
			const minAllowedDate = addHours(new Date(), MIN_HOURS_BEFORE_CLASS);

			if (classDate <= minAllowedDate) {
				return {
					success: false,
					error: "Classes must be more than 24 hours away to reschedule",
				};
			}

			// Validate class is within next 2 weeks
			const maxAllowedDate = addWeeks(new Date(), PERIOD_WEEKS);
			if (classDate > maxAllowedDate) {
				return {
					success: false,
					error: "Can only reschedule classes within the next 2 weeks",
				};
			}

			// Check for existing request for this class date
			const { data: existingForDate } = await supabase
				.from("reschedule_requests")
				.select("id")
				.eq("student_id", student.id)
				.eq("cohort_id", parsedInput.cohortId)
				.eq("original_class_date", parsedInput.originalClassDate)
				.neq("status", "cancelled")
				.single();

			if (existingForDate) {
				return {
					success: false,
					error: "A reschedule request already exists for this class",
				};
			}

			// Count pending requests in current 2-week period
			const periodStart = addWeeks(new Date(), -PERIOD_WEEKS);
			const { count } = await supabase
				.from("reschedule_requests")
				.select("id", { count: "exact", head: true })
				.eq("student_id", student.id)
				.eq("status", "pending")
				.gte("created_at", periodStart.toISOString());

			if ((count ?? 0) >= MAX_REQUESTS_PER_PERIOD) {
				return {
					success: false,
					error: `Maximum ${MAX_REQUESTS_PER_PERIOD} pending requests allowed per 2-week period`,
				};
			}

			// Create the request
			const { data: newRequest, error: createError } = await supabase
				.from("reschedule_requests")
				.insert({
					student_id: student.id,
					cohort_id: parsedInput.cohortId,
					original_class_date: parsedInput.originalClassDate,
					proposed_datetime: parsedInput.proposedDatetime,
					reason: parsedInput.reason || null,
					status: "pending",
				})
				.select()
				.single();

			if (createError) {
				console.error("Error creating reschedule request:", createError);
				return { success: false, error: "Failed to create reschedule request" };
			}

			// Get teacher info from weekly_sessions for this cohort
			// Teacher's email is in the linked user account (table name is "user", not "users")
			// Teachers table has first_name and last_name, not full_name
			const { data: weeklySession, error: sessionError } = await supabase
				.from("weekly_sessions")
				.select(
					`
					teacher:teachers (
						id,
						first_name,
						last_name,
						user (
							email
						)
					)
				`,
				)
				.eq("cohort_id", parsedInput.cohortId)
				.not("teacher_id", "is", null)
				.limit(1)
				.single();

			// Send email to teacher if we have teacher info with linked user
			if (sessionError) {
				console.log(
					"[Reschedule] No weekly session with teacher found:",
					sessionError.message,
				);
			} else if (weeklySession?.teacher) {
				const teacher = weeklySession.teacher as unknown as {
					id: string;
					first_name: string;
					last_name: string;
					user: { email: string } | null;
				};

				const teacherEmail = teacher.user?.email;
				const teacherFullName = `${teacher.first_name} ${teacher.last_name}`.trim();
				console.log("[Reschedule] Teacher info:", {
					teacherName: teacherFullName,
					hasUser: !!teacher.user,
					teacherEmail,
				});

				if (teacherEmail) {
					const studentName =
						student.first_name || student.full_name || "A student";
					const cohortName =
						cohortData.nickname || cohortData.product.display_name || "Private Class";

					console.log("[Reschedule] Sending email to teacher:", teacherEmail);

					// Send email notification (don't await - fire and forget)
					sendRescheduleRequestNotification({
						teacherEmail,
						teacherName: teacher.first_name || "Teacher",
						studentName,
						cohortName,
						originalClassDate: format(classDate, "EEEE, MMMM d, yyyy"),
						originalClassTime: format(classDate, "h:mm a"),
						proposedDatetime: parsedInput.proposedDatetime,
						reason: parsedInput.reason,
					}).catch((err) => {
						console.error("Failed to send reschedule notification email:", err);
					});
				} else {
					console.log(
						"[Reschedule] Teacher has no linked user account with email",
					);
				}
			}

			return { success: true, requestId: newRequest.id };
		} catch (error) {
			console.error("Create reschedule request error:", error);
			return { success: false, error: "An unexpected error occurred" };
		}
	});
