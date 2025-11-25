import { createClient } from "@/lib/supabase/server";

export interface StudentReadStatus {
	student: {
		id: string;
		full_name: string | null;
		email: string | null;
	};
	read_at: string | null;
	has_read: boolean;
}

export async function getReadStatsList(announcementId: string) {
	const supabase = await createClient();

	// First, get the announcement to determine scope
	const { data: announcement, error: announcementError } = await supabase
		.from("announcements")
		.select("scope, cohort_id")
		.eq("id", announcementId)
		.single();

	if (announcementError) {
		throw new Error(
			`Failed to fetch announcement: ${announcementError.message}`,
		);
	}

	// Get list of students who should see this announcement
	let studentsQuery;

	if (announcement.scope === "school_wide") {
		// All students
		studentsQuery = supabase
			.from("students")
			.select("id, full_name, email")
			.is("deleted_at", null);
	} else if (announcement.cohort_id) {
		// Students in the specific cohort with active enrollment
		studentsQuery = supabase
			.from("enrollments")
			.select(
				`
        student_id,
        students!enrollments_student_id_fkey(
          id,
          full_name,
          email
        )
      `,
			)
			.eq("cohort_id", announcement.cohort_id)
			.in("status", ["paid", "welcome_package_sent"]); // Active enrollment statuses
	} else {
		return [];
	}

	const { data: studentsData, error: studentsError } = await studentsQuery;

	if (studentsError) {
		throw new Error(`Failed to fetch students: ${studentsError.message}`);
	}

	// Get all reads for this announcement
	const { data: reads, error: readsError } = await supabase
		.from("announcement_reads")
		.select("student_id, read_at")
		.eq("announcement_id", announcementId);

	if (readsError) {
		throw new Error(`Failed to fetch reads: ${readsError.message}`);
	}

	// Create a map of reads for quick lookup
	const readsMap = new Map(reads?.map((r) => [r.student_id, r.read_at]) || []);

	// Process students based on announcement scope
	let studentsList: StudentReadStatus[] = [];

	if (announcement.scope === "school_wide") {
		studentsList = (studentsData || []).map((student: any) => ({
			student: {
				id: student.id,
				full_name: student.full_name,
				email: student.email,
			},
			read_at: readsMap.get(student.id) || null,
			has_read: readsMap.has(student.id),
		}));
	} else {
		// For cohort-specific, studentsData has a different structure from enrollments query
		studentsList = (studentsData || []).map((enrollment: any) => {
			const student = enrollment.students;
			return {
				student: {
					id: student.id,
					full_name: student.full_name,
					email: student.email,
				},
				read_at: readsMap.get(student.id) || null,
				has_read: readsMap.has(student.id),
			};
		});
	}

	// Sort by read status (unread first) and then by name
	return studentsList.sort((a, b) => {
		if (a.has_read !== b.has_read) {
			return a.has_read ? 1 : -1;
		}
		return (a.student.full_name || "").localeCompare(b.student.full_name || "");
	});
}
