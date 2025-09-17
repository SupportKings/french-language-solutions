import { supabase } from "../../lib/supabase";
import { formatCohortForMake } from "./utils";

export class ClassBookingService {

	async findAvailableCohortsWithSessions(currentLevelCode: string = "a0") {
		// Get current date + 14 days
		const minStartDate = new Date();
		minStartDate.setDate(minStartDate.getDate() + 14);
		const minStartDateStr = minStartDate.toISOString().split('T')[0];

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
			const maxStudents = cohort.max_students || Infinity;

			// Only include if there's space
			if (activeEnrollments < maxStudents) {
				eligibleCohorts.push({
					...cohort,
					activeEnrollmentCount: activeEnrollments
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

				return {
					id: cohort.id,
					start_date: cohort.start_date,
					max_students: cohort.max_students,
					current_enrollments: cohort.activeEnrollmentCount,
					available_spots: (cohort.max_students || 0) - cohort.activeEnrollmentCount,
					room_type: cohort.room_type,
					product: cohort.products,
					current_level: cohort.language_levels,
					weekly_sessions: sessions || []
				};
			})
		);

		return cohortsWithSessions;
	}

	async getAvailableCohorts(levelCode: string = "a0") {
		// Get available cohorts
		const cohortsWithSessions = await this.findAvailableCohortsWithSessions(levelCode);
		
		// Format cohorts for Make.com
		const formattedCohorts = cohortsWithSessions.map(formatCohortForMake);

		return formattedCohorts;
	}
}