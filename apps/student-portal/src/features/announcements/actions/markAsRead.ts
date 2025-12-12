"use server";

import { createClient } from "@/lib/supabase/server";

export async function markAnnouncementAsRead(
	announcementId: string,
	studentId: string,
) {
	const supabase = await createClient();

	// Check if already marked as read
	const { data: existing } = await supabase
		.from("announcement_reads")
		.select("id")
		.eq("announcement_id", announcementId)
		.eq("student_id", studentId)
		.single();

	if (existing) {
		// Already marked as read
		return { success: true, alreadyRead: true };
	}

	// Insert read record
	const { error } = await supabase.from("announcement_reads").insert({
		announcement_id: announcementId,
		student_id: studentId,
	});

	if (error) {
		console.error("Error marking announcement as read:", error);
		throw new Error("Failed to mark announcement as read");
	}

	return { success: true, alreadyRead: false };
}
