import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/students - List students with pagination, search, and filters
export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		const searchParams = request.nextUrl.searchParams;
		
		// Parse query parameters - support multiple values for all filter fields
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "20");
		const search = searchParams.get("search") || "";
		const desired_starting_language_level_id = searchParams.getAll("desired_starting_language_level_id");
		const initial_channel = searchParams.getAll("initial_channel");
		const communication_channel = searchParams.getAll("communication_channel");
		const enrollmentStatus = searchParams.getAll("enrollment_status");
		const is_full_beginner = searchParams.get("is_full_beginner");
		const added_to_email_newsletter = searchParams.get("added_to_email_newsletter");
		const is_under_16 = searchParams.get("is_under_16");
		const sortBy = searchParams.get("sortBy") || "created_at";
		const sortOrder = searchParams.get("sortOrder") || "desc";
		
		// Calculate offset
		const offset = (page - 1) * limit;
		
		// Check if we have filters that require post-processing (enrollment status or multiple values)
		const hasComplexFilters = enrollmentStatus.length > 0 || 
			desired_starting_language_level_id.length > 1 ||
			initial_channel.length > 1 ||
			communication_channel.length > 0;

		// For complex filters, we need to fetch all data and filter in JavaScript
		// For simple filters, we can use database-level filtering for better performance
		const useComplexFiltering = hasComplexFilters;
		
		// Build base query
		let query = supabase
			.from("students")
			.select(`
				*,
				desired_language_level:language_levels!desired_starting_language_level_id (
					id,
					code,
					display_name,
					level_group
				),
				enrollments (
					id,
					status,
					cohort_id,
					created_at,
					updated_at
				)
			`, { count: useComplexFiltering ? undefined : "exact" })
			.is("deleted_at", null); // Exclude soft deleted

		// Apply database-level filters only if not using complex filtering
		if (!useComplexFiltering) {
			query = query.range(offset, offset + limit - 1)
				.order(sortBy, { ascending: sortOrder === "asc" });
			
			// Apply simple filters at database level
			if (search) {
				query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
			}
			
			if (desired_starting_language_level_id.length === 1) {
				query = query.eq("desired_starting_language_level_id", desired_starting_language_level_id[0]);
			}
			
			if (initial_channel.length === 1) {
				query = query.eq("initial_channel", initial_channel[0]);
			}
			
			if (communication_channel.length === 1) {
				query = query.eq("communication_channel", communication_channel[0]);
			}
			
			if (is_full_beginner !== null && is_full_beginner !== undefined) {
				query = query.eq("is_full_beginner", is_full_beginner === "true");
			}
			
			if (added_to_email_newsletter !== null && added_to_email_newsletter !== undefined) {
				query = query.eq("added_to_email_newsletter", added_to_email_newsletter === "true");
			}
			
			if (is_under_16 !== null && is_under_16 !== undefined) {
				query = query.eq("is_under_16", is_under_16 === "true");
			}
		} else {
			// For complex filtering, fetch all data
			query = query.order(sortBy, { ascending: sortOrder === "asc" });
		}
		
		const { data, error, count } = await query;
		
		if (error) {
			console.error("Error fetching students:", error);
			return NextResponse.json(
				{ error: "Failed to fetch students" },
				{ status: 500 }
			);
		}
		
		// Process data to add latest enrollment status
		const processedData = (data || []).map(student => {
			// Find the latest enrollment
			const latestEnrollment = student.enrollments?.sort((a: any, b: any) => 
				new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
			)[0];
			
			return {
				...student,
				enrollment_status: latestEnrollment?.status || null,
				latest_enrollment: latestEnrollment || null
			};
		});
		
		// Apply complex filtering if needed
		if (useComplexFiltering) {
			let filteredData = processedData;
			
			// Enrollment status filter (multiple values)
			if (enrollmentStatus.length > 0) {
				filteredData = filteredData.filter(student => 
					enrollmentStatus.includes(student.enrollment_status)
				);
			}
			
			// Language level filter (multiple values)
			if (desired_starting_language_level_id.length > 0) {
				filteredData = filteredData.filter(student => 
					desired_starting_language_level_id.includes(student.desired_starting_language_level_id)
				);
			}
			
			// Initial channel filter (multiple values)
			if (initial_channel.length > 0) {
				filteredData = filteredData.filter(student => 
					initial_channel.includes(student.initial_channel)
				);
			}
			
			// Communication channel filter (multiple values)
			if (communication_channel.length > 0) {
				filteredData = filteredData.filter(student => 
					communication_channel.includes(student.communication_channel)
				);
			}
			
			// Boolean filters
			if (is_full_beginner !== null && is_full_beginner !== undefined) {
				const boolValue = is_full_beginner === "true";
				filteredData = filteredData.filter(student => 
					student.is_full_beginner === boolValue
				);
			}
			
			if (added_to_email_newsletter !== null && added_to_email_newsletter !== undefined) {
				const boolValue = added_to_email_newsletter === "true";
				filteredData = filteredData.filter(student => 
					student.added_to_email_newsletter === boolValue
				);
			}
			
			if (is_under_16 !== null && is_under_16 !== undefined) {
				const boolValue = is_under_16 === "true";
				filteredData = filteredData.filter(student => 
					student.is_under_16 === boolValue
				);
			}
			
			// Search filter
			if (search) {
				filteredData = filteredData.filter(student => 
					student.full_name?.toLowerCase().includes(search.toLowerCase()) ||
					student.email?.toLowerCase().includes(search.toLowerCase())
				);
			}
			
			// Apply pagination to filtered results
			const startIndex = offset;
			const endIndex = offset + limit;
			const paginatedData = filteredData.slice(startIndex, endIndex);
			
			return NextResponse.json({
				data: paginatedData,
				meta: {
					total: filteredData.length,
					page,
					limit,
					totalPages: Math.ceil(filteredData.length / limit),
				},
			});
		}
		
		// For simple queries without complex filtering
		return NextResponse.json({
			data: processedData,
			meta: {
				total: count || 0,
				page,
				limit,
				totalPages: Math.ceil((count || 0) / limit),
			},
		});
	} catch (error) {
		console.error("Error in GET /api/students:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// POST /api/students - Create a new student
export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient();
		const body = await request.json();
		
		// Body already uses snake_case from frontend
		const { data, error } = await supabase
			.from("students")
			.insert(body)
			.select()
			.single();
		
		if (error) {
			console.error("Error creating student:", error);
			return NextResponse.json(
				{ error: "Failed to create student" },
				{ status: 500 }
			);
		}
		
		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		console.error("Error in POST /api/students:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}