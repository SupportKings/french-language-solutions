import { createClient } from "@/lib/supabase/server";

import type { RescheduleRequest } from "../types";

/**
 * Get reschedule requests for a student within the last 2 weeks
 * Used for displaying history and checking request limits
 */
export async function getRescheduleRequests(
	studentId: string,
	cohortId?: string,
): Promise<RescheduleRequest[]> {
	const supabase = await createClient();

	// Calculate 2 weeks ago
	const twoWeeksAgo = new Date();
	twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

	let query = supabase
		.from("reschedule_requests")
		.select("*")
		.eq("student_id", studentId)
		.gte("created_at", twoWeeksAgo.toISOString())
		.order("created_at", { ascending: false });

	if (cohortId) {
		query = query.eq("cohort_id", cohortId);
	}

	const { data, error } = await query;

	if (error) {
		console.error("Error fetching reschedule requests:", error);
		return [];
	}

	return (data || []).map((request) => ({
		id: request.id,
		studentId: request.student_id,
		cohortId: request.cohort_id,
		originalClassDate: request.original_class_date,
		proposedDatetime: request.proposed_datetime,
		reason: request.reason,
		status: request.status,
		adminNotes: request.teacher_notes,
		createdAt: request.created_at || "",
		updatedAt: request.updated_at || "",
	}));
}

/**
 * Count active (non-cancelled) reschedule requests in current 2-week period
 * Used for checking the 3-request limit
 */
export async function countActiveRequestsInPeriod(
	studentId: string,
	cohortId: string,
): Promise<number> {
	const supabase = await createClient();

	// Calculate 2 weeks ago
	const twoWeeksAgo = new Date();
	twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

	const { count, error } = await supabase
		.from("reschedule_requests")
		.select("*", { count: "exact", head: true })
		.eq("student_id", studentId)
		.eq("cohort_id", cohortId)
		.neq("status", "cancelled")
		.gte("created_at", twoWeeksAgo.toISOString());

	if (error) {
		console.error("Error counting reschedule requests:", error);
		return 0;
	}

	return count || 0;
}

/**
 * Check if a request already exists for a specific class date
 */
export async function hasExistingRequestForDate(
	studentId: string,
	cohortId: string,
	classDate: string,
): Promise<boolean> {
	const supabase = await createClient();

	const { count, error } = await supabase
		.from("reschedule_requests")
		.select("*", { count: "exact", head: true })
		.eq("student_id", studentId)
		.eq("cohort_id", cohortId)
		.eq("original_class_date", classDate)
		.neq("status", "cancelled");

	if (error) {
		console.error("Error checking existing request:", error);
		return false;
	}

	return (count || 0) > 0;
}
