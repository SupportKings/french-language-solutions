import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// POST /api/attendance/bulk - Create multiple attendance records
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { records } = body;

		if (!records || !Array.isArray(records) || records.length === 0) {
			return NextResponse.json(
				{ error: "Records array is required" },
				{ status: 400 },
			);
		}

		const supabase = await createClient();

		// Get the current user (teacher) for marking who created the records
		const {
			data: { user },
		} = await supabase.auth.getUser();

		// Add created_at and updated_at timestamps to each record
		const recordsWithTimestamps = records.map((record) => ({
			...record,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			// TODO: Add created_by once we have teacher authentication linked
		}));

		// Insert all records at once
		const { data, error } = await supabase
			.from("attendance_records")
			.insert(recordsWithTimestamps)
			.select();

		if (error) {
			console.error("Error creating attendance records:", error);
			return NextResponse.json(
				{ error: "Failed to create attendance records" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			success: true,
			count: data.length,
			records: data,
		});
	} catch (error) {
		console.error("Error in POST /api/attendance/bulk:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
