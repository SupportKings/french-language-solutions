import { supabase } from "../../lib/supabase";
import { triggerWebhook } from "../../lib/webhooks";
import { formatCohortForMake } from "./utils";

export class ClassBookingService {
	async findAvailableCohortsWithSessions(currentLevelCode = "a0") {
		// Get current date + 14 days
		const minStartDate = new Date();
		minStartDate.setDate(minStartDate.getDate() - 14);
		const minStartDateStr = minStartDate.toISOString().split("T")[0];

		console.log("🔍 Min start date:", minStartDateStr);

		// Find language level with code a0
		const { data: level, error: levelError } = await supabase
			.from("language_levels")
			.select("*")
			.eq("code", currentLevelCode)
			.single();

		if (levelError || !level) {
			console.error("Error finding language level:", levelError);
			return [];
		}

		// Find cohorts matching conditions with related data
		const { data: cohorts, error: cohortsError } = await supabase
			.from("cohorts")
			.select(`
				*,
				products!cohorts_product_id_products_id_fk (*),
				language_levels!cohorts_current_level_id_language_levels_id_fk (*)
			`)
			.gte("start_date", minStartDateStr)
			.eq("current_level_id", level.id)
			.eq("cohort_status", "enrollment_open");

		console.log("🔍 Found cohorts:", cohorts);

		if (cohortsError || !cohorts) {
			console.error("Error finding cohorts:", cohortsError);
			return [];
		}

		// Filter cohorts where product format is "group" and check enrollment limits
		const eligibleCohorts = [];
		for (const cohort of cohorts) {
			// Check product format
			if (cohort.products?.format !== "group") {
				continue;
			}

			// Count active enrollments
			const { count, error: countError } = await supabase
				.from("enrollments")
				.select("*", { count: "exact", head: true })
				.eq("cohort_id", cohort.id)
				.in("status", ["paid", "welcome_package_sent"]);

			if (countError) {
				console.error("Error counting enrollments:", countError);
				continue;
			}

			const activeEnrollments = count || 0;
			// Treat null as unlimited capacity (Infinity for comparison)
			const maxStudents =
				cohort.max_students === null
					? Number.POSITIVE_INFINITY
					: cohort.max_students;

			// Only include if there's space
			if (activeEnrollments < maxStudents) {
				eligibleCohorts.push({
					...cohort,
					activeEnrollmentCount: activeEnrollments,
					// Store the normalized max for consistent handling later
					normalizedMaxStudents: maxStudents,
				});
			}
		}

		// Get weekly sessions for each eligible cohort
		const cohortsWithSessions = await Promise.all(
			eligibleCohorts.map(async (cohort) => {
				const { data: sessions, error: sessionsError } = await supabase
					.from("weekly_sessions")
					.select(`
						*,
						teachers!weekly_sessions_teacher_id_teachers_id_fk (
							id,
							first_name,
							last_name
						)
					`)
					.eq("cohort_id", cohort.id);

				if (sessionsError) {
					console.error("Error fetching sessions:", sessionsError);
				}

				// Calculate available spots, ensuring it's never negative
				// If max_students is null (unlimited), return null for available_spots
				// Otherwise, calculate and ensure non-negative
				const availableSpots =
					cohort.max_students === null
						? null // Unlimited capacity
						: Math.max(0, cohort.max_students - cohort.activeEnrollmentCount);

				return {
					id: cohort.id,
					start_date: cohort.start_date,
					max_students: cohort.max_students,
					current_enrollments: cohort.activeEnrollmentCount,
					available_spots: availableSpots,
					room_type: cohort.room_type,
					product: cohort.products,
					current_level: cohort.language_levels,
					weekly_sessions: sessions || [],
				};
			}),
		);

		return cohortsWithSessions;
	}

	async getAvailableCohorts(levelCode = "a0") {
		// Get available cohorts
		const cohortsWithSessions =
			await this.findAvailableCohortsWithSessions(levelCode);

		// Format cohorts for Make.com
		const formattedCohorts = cohortsWithSessions.map(formatCohortForMake);

		return formattedCohorts;
	}

	/**
	 * Get Stripe payment URL for an enrollment
	 * Returns the Stripe signup link with client reference ID
	 */
	async getPaymentUrl(enrollmentId: string): Promise<{ success: boolean; paymentUrl?: string; error?: string }> {
		try {
			// Fetch enrollment with related cohort and product data
			const { data: enrollment, error: enrollmentError } = await supabase
				.from("enrollments")
				.select(`
					id,
					student_id,
					cohort_id,
					status,
					cohorts!enrollments_cohort_id_fkey (
						id,
						products!cohorts_product_id_products_id_fk (
							id,
							signup_link_for_self_checkout
						)
					)
				`)
				.eq("id", enrollmentId)
				.single();

			if (enrollmentError || !enrollment) {
				console.error("Error fetching enrollment:", enrollmentError);
				return {
					success: false,
					error: "Enrollment not found",
				};
			}

			// Check if the product has a Stripe signup link
			// Note: Supabase returns nested relationships as arrays
			const cohort = Array.isArray(enrollment.cohorts) ? enrollment.cohorts[0] : enrollment.cohorts;
			const product = Array.isArray(cohort?.products) ? cohort.products[0] : cohort?.products;
			const stripeSignupLink = product?.signup_link_for_self_checkout;

			if (!stripeSignupLink) {
				return {
					success: false,
					error: "No Stripe signup link configured for this product",
				};
			}

			// Build the payment URL with client reference ID
			// Format: {Stripe Signup Link}&?client_reference_id={enrollment_id}%20{student_id}
			const clientReferenceId = `${enrollmentId}%20${enrollment.student_id}`;
			const paymentUrl = `${stripeSignupLink}?client_reference_id=${clientReferenceId}`;

			return {
				success: true,
				paymentUrl,
			};
		} catch (error) {
			console.error("Error generating payment URL:", error);
			return {
				success: false,
				error: "Failed to generate payment URL",
			};
		}
	}

	async processAbandonedEnrollments() {
		const now = new Date();
		const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
		const sixtyMinutesAgo = new Date(now.getTime() - 60 * 60 * 1000);

		// Find enrollments updated between 30-60 minutes ago with specific statuses
		const { data: abandonedEnrollments, error: fetchError } = await supabase
			.from("enrollments")
			.select(`
				*,
				students!enrollments_student_id_fkey (*),
				cohorts!enrollments_cohort_id_fkey (
					*,
					products!cohorts_product_id_products_id_fk (*)
				)
			`)
			.gte("updated_at", sixtyMinutesAgo.toISOString())
			.lte("updated_at", thirtyMinutesAgo.toISOString())
			.in("status", ["beginner_form_filled", "contract_signed"]);

		if (fetchError) {
			console.error("Error fetching abandoned enrollments:", fetchError);
			throw new Error("Failed to fetch abandoned enrollments");
		}

		const processedDetails = [];
		let processedCount = 0;

		for (const enrollment of abandonedEnrollments || []) {
			try {
				// Handle array relationships from Supabase
				const student = Array.isArray(enrollment.students) ? enrollment.students[0] : enrollment.students;
				const cohort = Array.isArray(enrollment.cohorts) ? enrollment.cohorts[0] : enrollment.cohorts;
				const product = Array.isArray(cohort?.products) ? cohort.products[0] : cohort?.products;

				// Determine new status
				const newStatus =
					enrollment.status === "beginner_form_filled"
						? "contract_abandoned"
						: "payment_abandoned";

				// Update enrollment status
				const { error: updateError } = await supabase
					.from("enrollments")
					.update({
						status: newStatus,
						updated_at: new Date().toISOString(),
					})
					.eq("id", enrollment.id);

				if (updateError) {
					console.error(
						`Error updating enrollment ${enrollment.id}:`,
						updateError,
					);
					continue;
				}

				// Prepare webhook data
				const webhookData = {
					enrollmentId: enrollment.id,
					studentId: enrollment.student_id,
					cohortId: enrollment.cohort_id,
					oldStatus: enrollment.status,
					newStatus: newStatus,
					student: {
						id: student?.id,
						email: student?.email,
						firstName: student?.first_name,
						lastName: student?.last_name,
					},
					cohort: {
						id: cohort?.id,
						startDate: cohort?.start_date,
						productFormat: product?.format,
					},
					product: {
						id: product?.id,
						displayName: product?.display_name,
						format: product?.format,
						location: product?.location,
					},
				};

				// Send webhook
				const webhookResult = await triggerWebhook(
					"make",
					"abandonedEnrollments",
					webhookData,
				);

				if (!webhookResult.success) {
					console.error(
						`Webhook failed for enrollment ${enrollment.id}:`,
						webhookResult.error,
					);
				}

				processedDetails.push({
					enrollmentId: enrollment.id,
					studentId: enrollment.student_id,
					oldStatus: enrollment.status,
					newStatus: newStatus,
				});

				processedCount++;
			} catch (error) {
				console.error(`Error processing enrollment ${enrollment.id}:`, error);
			}
		}

		return {
			processedCount,
			details: processedDetails,
		};
	}
}
