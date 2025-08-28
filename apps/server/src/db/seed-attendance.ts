import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";
import { db } from "./index";
import {
	attendanceRecords,
	classes,
	cohorts,
	enrollments,
	students,
	teachers,
} from "./schema";

async function seedAttendance() {
	console.log("🌱 Starting attendance records seed...");

	try {
		// First, check if we have existing data to work with
		const existingStudents = await db.select().from(students).limit(50);
		const existingCohorts = await db.select().from(cohorts).limit(20);
		const existingEnrollments = await db.select().from(enrollments).limit(100);
		const existingClasses = await db.select().from(classes).limit(50);
		const existingTeachers = await db.select().from(teachers).limit(10);

		if (existingStudents.length === 0 || existingCohorts.length === 0) {
			console.log(
				"❌ No existing students or cohorts found. Please run the main seed first: bun run seed",
			);
			return;
		}

		console.log(
			`Found ${existingStudents.length} students, ${existingCohorts.length} cohorts, ${existingEnrollments.length} enrollments, ${existingClasses.length} classes`,
		);

		// Clear only attendance records (not other tables!)
		console.log("🗑️  Clearing existing attendance records...");
		await db.delete(attendanceRecords);

		// Generate attendance records
		const attendanceData: any[] = [];

		// Generate attendance records for existing enrollments
		for (const enrollment of existingEnrollments.slice(0, 30)) {
			// Use first 30 enrollments
			const cohortClasses = existingClasses
				.filter((c) => c.cohortId === enrollment.cohortId)
				.slice(0, 6); // Get first 6 classes for this cohort

			// Create attendance records for these classes
			for (const classItem of cohortClasses) {
				const attendanceDate = new Date(classItem.startTime);
				attendanceDate.setHours(0, 0, 0, 0); // Set to beginning of day

				// Simulate realistic attendance patterns
				const randomAttendance = Math.random();
				let status: "attended" | "not_attended" | "unset";

				if (randomAttendance > 0.85) {
					status = "not_attended"; // 15% absence rate
				} else if (randomAttendance > 0.1) {
					status = "attended"; // 75% attendance rate
				} else {
					status = "unset"; // 10% not yet marked
				}

				attendanceData.push({
					studentId: enrollment.studentId,
					cohortId: enrollment.cohortId,
					classId: classItem.id,
					attendanceDate: attendanceDate.toISOString().split("T")[0],
					status,
					notes:
						status === "not_attended"
							? faker.helpers.arrayElement([
									"Student was sick",
									"Family emergency",
									"Work conflict",
									"Travel",
									"Technical issues (online class)",
									null,
								])
							: null,
					markedBy:
						status !== "unset" && existingTeachers.length > 0
							? faker.helpers.arrayElement(existingTeachers).id
							: null,
					markedAt: status !== "unset" ? faker.date.recent({ days: 7 }) : null,
				});
			}
		}

		// Add some standalone attendance records (for daily tracking without specific classes)
		const recentDates = new Set<string>();

		for (let i = 0; i < 50; i++) {
			const enrollment = faker.helpers.arrayElement(existingEnrollments);
			const attendanceDate = faker.date.recent({ days: 60 });
			attendanceDate.setHours(0, 0, 0, 0);

			// Create a unique key for student-date combination
			const dateStr = attendanceDate.toISOString().split("T")[0];
			const key = `${enrollment.studentId}-${dateStr}`;

			// Skip if we already have a record for this student on this date
			if (recentDates.has(key)) {
				continue;
			}
			recentDates.add(key);

			const status = faker.helpers.arrayElement([
				"attended",
				"not_attended",
				"unset",
			]);

			attendanceData.push({
				studentId: enrollment.studentId,
				cohortId: enrollment.cohortId,
				classId: null, // No specific class linked - just daily attendance
				attendanceDate: dateStr,
				status,
				notes:
					status === "not_attended"
						? faker.helpers.arrayElement([
								"Absent - no reason provided",
								"Doctor's appointment",
								"Personal day",
								"Weather conditions",
								"Transportation issues",
								null,
							])
						: status === "attended" &&
								faker.datatype.boolean({ probability: 0.1 })
							? faker.helpers.arrayElement([
									"Great participation today!",
									"Arrived late but caught up quickly",
									"Excellent progress shown",
									null,
								])
							: null,
				markedBy:
					status !== "unset" && existingTeachers.length > 0
						? faker.helpers.arrayElement(existingTeachers).id
						: null,
				markedAt: status !== "unset" ? faker.date.recent({ days: 3 }) : null,
			});
		}

		// Insert all attendance records
		if (attendanceData.length > 0) {
			const insertedAttendanceRecords = await db
				.insert(attendanceRecords)
				.values(attendanceData)
				.returning();
			console.log(
				`✅ Inserted ${insertedAttendanceRecords.length} attendance records`,
			);

			// Show some statistics
			const attendedCount = attendanceData.filter(
				(a) => a.status === "attended",
			).length;
			const absentCount = attendanceData.filter(
				(a) => a.status === "not_attended",
			).length;
			const unsetCount = attendanceData.filter(
				(a) => a.status === "unset",
			).length;

			console.log("📊 Statistics:");
			console.log(
				`   - Attended: ${attendedCount} (${Math.round((attendedCount / attendanceData.length) * 100)}%)`,
			);
			console.log(
				`   - Absent: ${absentCount} (${Math.round((absentCount / attendanceData.length) * 100)}%)`,
			);
			console.log(
				`   - Not marked: ${unsetCount} (${Math.round((unsetCount / attendanceData.length) * 100)}%)`,
			);
		} else {
			console.log("⚠️  No attendance records to insert");
		}

		console.log("✨ Attendance seed completed successfully!");
	} catch (error) {
		console.error("❌ Error seeding attendance records:", error);
		throw error;
	}
}

// Run the seed
seedAttendance()
	.catch((error) => {
		console.error("❌ Attendance seed failed:", error);
		process.exit(1);
	})
	.finally(() => {
		process.exit(0);
	});
