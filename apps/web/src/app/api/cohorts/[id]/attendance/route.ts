import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const supabase = await createClient();

		const { data: attendanceRecords, error } = await supabase
			.from("attendance_records")
			.select(`
				*,
				students(
					id,
					full_name,
					email
				),
				classes(
					id,
					start_time,
					end_time
				),
				teachers(
					id,
					first_name,
					last_name
				)
			`)
			.eq("cohort_id", id)
			.order("attendance_date", { ascending: false });

		if (error) {
			console.error("Error fetching attendance records:", error);
			return NextResponse.json(
				{ error: "Failed to fetch attendance records" },
				{ status: 500 }
			);
		}

		// Transform the data to match our component's expectations
		const transformedRecords = (attendanceRecords || []).map(record => ({
			id: record.id,
			studentId: record.student_id,
			cohortId: record.cohort_id,
			classId: record.class_id,
			attendanceDate: record.attendance_date,
			status: record.status,
			notes: record.notes,
			markedBy: record.marked_by,
			markedAt: record.marked_at,
			student: record.students ? {
				id: record.students.id,
				full_name: record.students.full_name,
				email: record.students.email,
				phone: undefined,
			} : undefined,
			class: record.classes ? {
				id: record.classes.id,
				start_time: record.classes.start_time,
				end_time: record.classes.end_time,
			} : undefined,
			teacher: record.teachers ? {
				id: record.teachers.id,
				first_name: record.teachers.first_name,
				last_name: record.teachers.last_name,
			} : undefined,
		}));

		return NextResponse.json(transformedRecords);
	} catch (error) {
		console.error("Error in attendance GET:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}