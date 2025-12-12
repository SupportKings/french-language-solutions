import { supabase } from "../../lib/supabase";
import type {
	AvailableTeacher,
	DayOfWeek,
	GetAvailableTeachersRequest,
} from "./types";

export class TeacherService {
	private calculateHoursDifference(startTime: string, endTime: string): number {
		const [startHour, startMinute] = startTime.split(":").map(Number);
		const [endHour, endMinute] = endTime.split(":").map(Number);

		const startMinutes = startHour * 60 + startMinute;
		const endMinutes = endHour * 60 + endMinute;

		return (endMinutes - startMinutes) / 60;
	}

	private calculateTeacherWorkload(teacher: any): {
		weeklyHours: number;
		dailyHours: Record<DayOfWeek, number>;
	} {
		let weeklyHours = 0;
		const dailyHours: Record<string, number> = {
			monday: 0,
			tuesday: 0,
			wednesday: 0,
			thursday: 0,
			friday: 0,
			saturday: 0,
			sunday: 0,
		};

		for (const session of teacher.weekly_sessions) {
			// Skip sessions from cohorts that have ended
			if (session.cohort.cohort_status === "class_ended") {
				continue;
			}

			const hours = this.calculateHoursDifference(
				session.start_time,
				session.end_time,
			);

			weeklyHours += hours;
			dailyHours[session.day_of_week] += hours;
		}

		return { weeklyHours, dailyHours: dailyHours as Record<DayOfWeek, number> };
	}

	private normalizeDayOfWeek(day: string): DayOfWeek | null {
		const dayMapping: Record<string, DayOfWeek> = {
			mon: "monday",
			monday: "monday",
			tue: "tuesday",
			tuesday: "tuesday",
			wed: "wednesday",
			wednesday: "wednesday",
			thu: "thursday",
			thursday: "thursday",
			fri: "friday",
			friday: "friday",
			sat: "saturday",
			saturday: "saturday",
			sun: "sunday",
			sunday: "sunday",
		};

		const normalizedDay = day.toLowerCase();
		return dayMapping[normalizedDay] || null;
	}

	/**
	 * Finds teachers available for private one-to-one classes based on:
	 * 1. Basic availability (booking status, format, calendar, onboarding)
	 * 2. Student requirements (under 16 qualification)
	 * 3. Schedule compatibility (day availability)
	 * 4. Workload capacity (weekly and daily hour limits)
	 *
	 * @param request - Contains format, duration, day, student ID, and session structure
	 * @returns Array of available teachers with only id, first_name, last_name, and google_calendar_id
	 */
	async getAvailableTeachers(
		request: GetAvailableTeachersRequest,
	): Promise<AvailableTeacher[]> {
		// Normalize the day of week (handles "Mon", "Monday", etc.)
		const requestedDay = this.normalizeDayOfWeek(request.day_of_week);
		if (!requestedDay) {
			throw new Error(`Invalid day of week: ${request.day_of_week}`);
		}

		// Get student information
		const { data: student, error: studentError } = await supabase
			.from("students")
			.select("is_under_16")
			.eq("id", request.student_id)
			.single();

		if (studentError || !student) {
			throw new Error(`Student not found: ${request.student_id}`);
		}

		// Build the base query for teachers
		let teachersQuery = supabase
			.from("teachers")
			.select(`
				*,
				weekly_sessions!weekly_sessions_teacher_id_teachers_id_fk (
					id,
					cohort_id,
					day_of_week,
					start_time,
					end_time,
					cohort:cohorts!weekly_sessions_cohort_id_fkey (
						id,
						cohort_status
					)
				)
			`)
			.eq("available_for_booking", true)
			.eq("onboarding_status", "onboarded")
			.not("google_calendar_id", "is", null);

		// Apply format-specific filters
		if (request.format === "online") {
			teachersQuery = teachersQuery
				.eq("available_for_online_classes", true)
				.contains("days_available_online", [requestedDay]);
		} else {
			teachersQuery = teachersQuery
				.eq("available_for_in_person_classes", true)
				.contains("days_available_in_person", [requestedDay]);
		}

		// Apply under-16 filter if needed
		if (student.is_under_16) {
			teachersQuery = teachersQuery.eq("qualified_for_under_16", true);
		}

		const { data: teachers, error: teachersError } = await teachersQuery;

		if (teachersError) {
			throw new Error(`Failed to fetch teachers: ${teachersError.message}`);
		}

		if (!teachers || teachers.length === 0) {
			return [];
		}

		// Calculate class duration in hours
		const classDurationHours = request.duration_minutes / 60;
		const totalRequestedHours =
			request.session_structure === "double"
				? classDurationHours * 2
				: classDurationHours;

		// Filter teachers based on workload
		const availableTeachers: AvailableTeacher[] = [];

		for (const teacher of teachers) {
			const { weeklyHours, dailyHours } =
				this.calculateTeacherWorkload(teacher);

			// Check weekly hours limit
			const newWeeklyHours = weeklyHours + totalRequestedHours;
			if (
				teacher.maximum_hours_per_week &&
				newWeeklyHours > teacher.maximum_hours_per_week
			) {
				continue;
			}

			// Check daily hours limit for the requested day
			const currentDailyHours = dailyHours[requestedDay] || 0;
			const newDailyHours =
				currentDailyHours +
				(request.session_structure === "double"
					? classDurationHours * 2
					: classDurationHours);

			if (
				teacher.maximum_hours_per_day &&
				newDailyHours > teacher.maximum_hours_per_day
			) {
				continue;
			}

			// Teacher is available - return info with workload data and limits
			availableTeachers.push({
				id: teacher.id,
				first_name: teacher.first_name,
				last_name: teacher.last_name,
				google_calendar_id: teacher.google_calendar_id!,
				current_weekly_hours: weeklyHours,
				daily_hours: dailyHours,
				maximum_hours_per_week: teacher.maximum_hours_per_week,
				maximum_hours_per_day: teacher.maximum_hours_per_day,
			});
		}

		return availableTeachers;
	}
}
