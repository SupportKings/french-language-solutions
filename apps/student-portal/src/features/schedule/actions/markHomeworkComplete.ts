"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

/**
 * Mark homework as complete for an attendance record
 * Records the exact timestamp when the checkbox was checked
 */
export async function markHomeworkComplete(attendanceRecordId: string) {
	const supabase = await createClient();

	const now = new Date().toISOString();

	const { error } = await supabase
		.from("attendance_records")
		.update({
			homework_completed: true,
			homework_completed_at: now,
		})
		.eq("id", attendanceRecordId);

	if (error) {
		console.error("Error marking homework complete:", error);
		return { success: false, error: error.message };
	}

	// Revalidate the dashboard to refresh the data
	revalidatePath("/dashboard");

	return { success: true };
}

/**
 * Unmark homework as complete for an attendance record
 */
export async function unmarkHomeworkComplete(attendanceRecordId: string) {
	const supabase = await createClient();

	const { error } = await supabase
		.from("attendance_records")
		.update({
			homework_completed: false,
			homework_completed_at: null,
		})
		.eq("id", attendanceRecordId);

	if (error) {
		console.error("Error unmarking homework:", error);
		return { success: false, error: error.message };
	}

	// Revalidate the dashboard to refresh the data
	revalidatePath("/dashboard");

	return { success: true };
}
