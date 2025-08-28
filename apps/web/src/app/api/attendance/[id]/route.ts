import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/attendance/[id] - Update attendance record
export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const body = await request.json();
		const supabase = await createClient();

		// Get the current user (teacher) for marking who updated the attendance
		const { data: { user } } = await supabase.auth.getUser();

		const updateData: any = {
			marked_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
			// TODO: Add marked_by once we have teacher authentication linked
		};

		// Map camelCase fields to snake_case for database
		if (body.status !== undefined) {
			updateData.status = body.status;
		}
		if (body.notes !== undefined) {
			updateData.notes = body.notes;
		}
		if (body.homeworkCompleted !== undefined) {
			updateData.homework_completed = body.homeworkCompleted;
		}

		const { data, error } = await supabase
			.from("attendance_records")
			.update(updateData)
			.eq("id", id)
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
			.single();

		if (error) {
			console.error("Error updating attendance:", error);
			return NextResponse.json(
				{ error: "Failed to update attendance" },
				{ status: 500 }
			);
		}

		// Transform the response to match component expectations
		const transformedRecord = {
			id: data.id,
			studentId: data.student_id,
			cohortId: data.cohort_id,
			classId: data.class_id,
			attendanceDate: data.attendance_date,
			status: data.status,
			notes: data.notes,
			markedBy: data.marked_by,
			markedAt: data.marked_at,
			homeworkCompleted: data.homework_completed || false,
			student: data.students ? {
				id: data.students.id,
				full_name: data.students.full_name,
				email: data.students.email,
				phone: undefined,
			} : undefined,
			class: data.classes ? {
				id: data.classes.id,
				start_time: data.classes.start_time,
				end_time: data.classes.end_time,
			} : undefined,
			teacher: data.teachers ? {
				id: data.teachers.id,
				first_name: data.teachers.first_name,
				last_name: data.teachers.last_name,
			} : undefined,
		};

		return NextResponse.json(transformedRecord);
	} catch (error) {
		console.error("Error in PATCH /api/attendance/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// GET /api/attendance/[id] - Get a single attendance record
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const supabase = await createClient();

		const { data, error } = await supabase
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
			.eq("id", id)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Attendance record not found" },
					{ status: 404 }
				);
			}
			console.error("Error fetching attendance record:", error);
			return NextResponse.json(
				{ error: "Failed to fetch attendance record" },
				{ status: 500 }
			);
		}

		// Transform the response
		const transformedRecord = {
			id: data.id,
			studentId: data.student_id,
			cohortId: data.cohort_id,
			classId: data.class_id,
			attendanceDate: data.attendance_date,
			status: data.status,
			notes: data.notes,
			markedBy: data.marked_by,
			markedAt: data.marked_at,
			homeworkCompleted: data.homework_completed || false,
			student: data.students ? {
				id: data.students.id,
				full_name: data.students.full_name,
				email: data.students.email,
				phone: undefined,
			} : undefined,
			class: data.classes ? {
				id: data.classes.id,
				start_time: data.classes.start_time,
				end_time: data.classes.end_time,
			} : undefined,
			teacher: data.teachers ? {
				id: data.teachers.id,
				first_name: data.teachers.first_name,
				last_name: data.teachers.last_name,
			} : undefined,
		};

		return NextResponse.json(transformedRecord);
	} catch (error) {
		console.error("Error in GET /api/attendance/[id]:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}