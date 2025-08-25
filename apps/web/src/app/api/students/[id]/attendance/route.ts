import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { id: studentId } = await params;
		const supabase = await createClient();

		// Fetch attendance records with related data
		const { data: records, error: recordsError } = await supabase
			.from("attendance_records")
			.select(`
				*,
				classes (
					id,
					name,
					start_time,
					end_time
				),
				cohorts (
					id,
					format,
					current_level
				)
			`)
			.eq("student_id", studentId)
			.order("attendance_date", { ascending: false })
			.limit(100);

		if (recordsError) {
			console.error("Error fetching attendance records:", recordsError);
			return NextResponse.json(
				{ error: "Failed to fetch attendance records" },
				{ status: 500 }
			);
		}

		// Calculate statistics using raw SQL query
		const { data: stats, error: statsError } = await supabase.rpc(
			"get_attendance_stats",
			{ student_id_param: studentId }
		).single();

		// If the RPC doesn't exist, calculate manually
		let attendanceStats = {
			totalClasses: 0,
			present: { count: 0, percentage: 0 },
			absent: { count: 0, percentage: 0 },
			unset: { count: 0, percentage: 0 },
		};

		if (statsError) {
			// Manual calculation if RPC fails
			const total = records?.length || 0;
			const present = records?.filter(r => r.status === "attended").length || 0;
			const absent = records?.filter(r => r.status === "not_attended").length || 0;
			const unset = records?.filter(r => r.status === "unset").length || 0;

			attendanceStats = {
				totalClasses: total,
				present: {
					count: present,
					percentage: total > 0 ? Math.round((present / total) * 100) : 0,
				},
				absent: {
					count: absent,
					percentage: total > 0 ? Math.round((absent / total) * 100) : 0,
				},
				unset: {
					count: unset,
					percentage: total > 0 ? Math.round((unset / total) * 100) : 0,
				},
			};
		} else if (stats) {
			const total = Number(stats.total_classes) || 0;
			const presentCount = Number(stats.present_count) || 0;
			const absentCount = Number(stats.absent_count) || 0;
			const unsetCount = Number(stats.unset_count) || 0;

			attendanceStats = {
				totalClasses: total,
				present: {
					count: presentCount,
					percentage: total > 0 ? Math.round((presentCount / total) * 100) : 0,
				},
				absent: {
					count: absentCount,
					percentage: total > 0 ? Math.round((absentCount / total) * 100) : 0,
				},
				unset: {
					count: unsetCount,
					percentage: total > 0 ? Math.round((unsetCount / total) * 100) : 0,
				},
			};
		}

		// Format records for frontend
		const formattedRecords = records?.map(record => ({
			id: record.id,
			studentId: record.student_id,
			cohortId: record.cohort_id,
			classId: record.class_id,
			attendanceDate: record.attendance_date,
			status: record.status,
			notes: record.notes,
			markedBy: record.marked_by,
			markedAt: record.marked_at,
			createdAt: record.created_at,
			className: record.classes?.name || null,
			classStartTime: record.classes?.start_time || null,
			cohortName: record.cohorts ? `${record.cohorts.format} - Level ${record.cohorts.current_level}` : null,
		})) || [];

		return NextResponse.json({
			records: formattedRecords,
			stats: attendanceStats,
		});
	} catch (error) {
		console.error("Error fetching attendance:", error);
		return NextResponse.json(
			{ error: "Failed to fetch attendance records" },
			{ status: 500 }
		);
	}
}

// Update attendance status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
	try {
		const { id: studentId } = await params;
		const body = await request.json();
		const { recordId, status, notes } = body;

		if (!recordId || !status) {
			return NextResponse.json(
				{ error: "Record ID and status are required" },
				{ status: 400 }
			);
		}

		const supabase = await createClient();

		// Update the attendance record
		const { data, error } = await supabase
			.from("attendance_records")
			.update({
				status,
				notes,
				marked_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.eq("id", recordId)
			.eq("student_id", studentId)
			.select()
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Attendance record not found" },
					{ status: 404 }
				);
			}
			console.error("Error updating attendance:", error);
			return NextResponse.json(
				{ error: "Failed to update attendance record" },
				{ status: 500 }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error updating attendance:", error);
		return NextResponse.json(
			{ error: "Failed to update attendance record" },
			{ status: 500 }
		);
	}
}