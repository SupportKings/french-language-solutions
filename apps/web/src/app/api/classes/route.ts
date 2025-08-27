import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// GET /api/classes - List all classes with pagination and filters
export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		const searchParams = request.nextUrl.searchParams;
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");
		const search = searchParams.get("search") || "";
		const status = searchParams.get("status") || "";
		const mode = searchParams.get("mode") || "";
		const cohortId = searchParams.get("cohort_id") || "";
		const teacherId = searchParams.get("teacher_id") || "";
		const isActive = searchParams.get("is_active");

		const offset = (page - 1) * limit;

		let query = supabase
			.from("classes")
			.select(`
				*,
				cohort:cohorts(*)
			`, { count: "exact" })
			.is("deleted_at", null)
			.order("created_at", { ascending: false })
			.range(offset, offset + limit - 1);

		// Apply filters
		if (search) {
			query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
		}
		if (status) {
			query = query.eq("status", status);
		}
		if (mode) {
			query = query.eq("mode", mode);
		}
		if (cohortId) {
			query = query.eq("cohort_id", cohortId);
		}
		if (teacherId) {
			query = query.eq("teacher_id", teacherId);
		}
		if (isActive !== null && isActive !== undefined) {
			query = query.eq("is_active", isActive === "true");
		}

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching classes:", error);
			return NextResponse.json(
				{ error: "Failed to fetch classes" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			data,
			pagination: {
				total: count || 0,
				page,
				limit,
				totalPages: Math.ceil((count || 0) / limit),
			},
		});
	} catch (error) {
		console.error("Error in GET /api/classes:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// POST /api/classes - Create a new class
const createClassSchema = z.object({
	cohort_id: z.string().uuid(),
	name: z.string().min(1, "Name is required"),
	description: z.string().optional().nullable(),
	start_time: z.string().datetime(),
	end_time: z.string().datetime(),
	status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).default("scheduled"),
	mode: z.enum(["online", "in_person", "hybrid"]).default("online"),
	google_calendar_event_id: z.string().optional().nullable(),
	room: z.string().optional().nullable(),
	meeting_link: z.string().url().optional().nullable(),
	google_drive_folder_id: z.string().optional().nullable(),
	materials: z.string().optional().nullable(),
	max_students: z.number().int().positive().default(10),
	current_enrollment: z.number().int().min(0).default(0),
	teacher_id: z.string().uuid().optional().nullable(),
	is_active: z.boolean().default(true),
	notes: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient();
		const body = await request.json();
		const validatedData = createClassSchema.parse(body);

		const { data, error } = await supabase
			.from("classes")
			.insert([validatedData])
			.select()
			.single();

		if (error) {
			console.error("Error creating class:", error);
			return NextResponse.json(
				{ error: "Failed to create class" },
				{ status: 500 }
			);
		}

		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation error", details: error.issues },
				{ status: 400 }
			);
		}
		console.error("Error in POST /api/classes:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}