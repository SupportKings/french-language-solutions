import { db } from "./index";
import { 
	students, 
	teachers, 
	products, 
	cohorts, 
	enrollments,
	weeklySessions,
	classes,
	studentAssessments,
	templateFollowUpSequences,
	templateFollowUpMessages,
	automatedFollowUps,
	touchpoints,
	attendanceRecords
} from "./schema";
import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";

async function seed() {
	console.log("🌱 Starting seed...");

	// No need to check for user data as Better Auth manages users separately

	// Clear non-user data (in reverse order of dependencies)
	console.log("🗑️ Clearing existing non-user data...");
	await db.delete(attendanceRecords);
	await db.delete(touchpoints);
	await db.delete(automatedFollowUps);
	await db.delete(templateFollowUpMessages);
	await db.delete(templateFollowUpSequences);
	await db.delete(studentAssessments);
	await db.delete(classes);
	await db.delete(weeklySessions);
	await db.delete(enrollments);
	await db.delete(cohorts);
	await db.delete(products);
	await db.delete(teachers);
	await db.delete(students);
	
	// Note: Better Auth tables are managed separately

	// Seed Students (50)
	console.log("👥 Seeding students...");
	const studentsData = Array.from({ length: 50 }, () => ({
		fullName: faker.person.fullName(),
		email: faker.internet.email().toLowerCase(),
		mobilePhoneNumber: "+1" + faker.string.numeric(10),
		city: faker.location.city(),
		desiredStartingLanguageLevel: faker.helpers.arrayElement(["a1", "a2", "b1", "b2", "c1"] as const),
		initialChannel: faker.helpers.arrayElement(["form", "quiz", "call", "email"] as const),
		communicationChannel: faker.helpers.arrayElement(["sms_email", "email", "sms"] as const),
		isFullBeginner: faker.datatype.boolean(),
		purposeToLearn: faker.helpers.arrayElement([
			"Travel to France",
			"Business opportunities",
			"Academic requirements",
			"Personal interest",
			"Cultural appreciation"
		]),
		// Additional fields
		stateOrProvince: faker.location.state(),
		country: "United States",
		isActive: true,
		lifecycle: faker.helpers.arrayElement(["lead", "prospect", "active_student", "inactive_student", "alumni"] as const),
		canBeContacted: true,
		averageScore: faker.number.int({ min: 60, max: 100 }),
		homePhoneNumber: faker.datatype.boolean() ? "+1" + faker.string.numeric(10) : null,
	}));
	
	const insertedStudents = await db.insert(students).values(studentsData).returning();
	console.log(`✅ Inserted ${insertedStudents.length} students`);

	// Seed Teachers (10)
	console.log("👩‍🏫 Seeding teachers...");
	const teachersData = Array.from({ length: 10 }, () => ({
		firstName: faker.person.firstName(),
		lastName: faker.person.lastName(),
		email: faker.internet.email().toLowerCase(),
		phoneNumber: "+1" + faker.string.numeric(10),
		isActive: true,
		// Teaching preferences
		preferredLevels: faker.helpers.arrayElements(["a1", "a2", "b1", "b2", "c1", "c2"] as const, { min: 2, max: 4 }),
		availableForOnlineClasses: faker.datatype.boolean(),
		availableForInPersonClasses: faker.datatype.boolean(),
		// Availability
		weeklyAvailabilityHours: faker.number.int({ min: 10, max: 40 }),
		notes: faker.lorem.sentence(),
	}));
	
	const insertedTeachers = await db.insert(teachers).values(teachersData).returning();
	console.log(`✅ Inserted ${insertedTeachers.length} teachers`);

	// Seed Products (6)
	console.log("📦 Seeding products...");
	const productsData = [
		{
			displayName: "Beginner French Intensive",
			location: "online" as const,
			format: "group" as const,
			signupLinkForSelfCheckout: "https://checkout.example.com/beginner-intensive",
		},
		{
			displayName: "Business French Professional",
			location: "in_person" as const,
			format: "group" as const,
			signupLinkForSelfCheckout: "https://checkout.example.com/business-pro",
		},
		{
			displayName: "Private French Tutoring",
			location: "online" as const,
			format: "private" as const,
			signupLinkForSelfCheckout: "https://checkout.example.com/private-tutoring",
		},
		{
			displayName: "Conversational French",
			location: "hybrid" as const,
			format: "group" as const,
			signupLinkForSelfCheckout: "https://checkout.example.com/conversational",
		},
		{
			displayName: "DELF/DALF Preparation",
			location: "online" as const,
			format: "group" as const,
			signupLinkForSelfCheckout: "https://checkout.example.com/delf-prep",
		},
		{
			displayName: "Kids French Fun",
			location: "in_person" as const,
			format: "group" as const,
			signupLinkForSelfCheckout: "https://checkout.example.com/kids-french",
		},
	];
	
	const insertedProducts = await db.insert(products).values(productsData).returning();
	console.log(`✅ Inserted ${insertedProducts.length} products`);

	// Seed Cohorts with max_students and setup_finalized
	console.log("🎓 Seeding cohorts...");
	const cohortsData = [
		{
			title: "Spring 2024 Beginner French",
			format: "group" as const,
			productId: insertedProducts[0].id,
			startingLevel: "a1" as const,
			currentLevel: "a1_plus" as const,
			startDate: "2024-03-01",
			cohortStatus: "enrollment_closed" as const,
			roomType: "medium" as const,
			maxStudents: 12,
			setupFinalized: true,
		},
		{
			title: "Advanced Business French - Q2 2024",
			format: "group" as const,
			productId: insertedProducts[1].id,
			startingLevel: "b2" as const,
			currentLevel: "b2_plus" as const,
			startDate: "2024-04-15",
			cohortStatus: "enrollment_open" as const,
			roomType: "medium_plus" as const,
			maxStudents: 15,
			setupFinalized: true,
		},
		{
			title: "Summer Intensive 2024",
			format: "group" as const,
			productId: insertedProducts[3].id,
			startingLevel: "a2" as const,
			currentLevel: "a2" as const,
			startDate: "2024-06-01",
			cohortStatus: "enrollment_open" as const,
			roomType: "large" as const,
			maxStudents: 20,
			setupFinalized: false,
		},
		{
			title: "Private Tutoring - Sarah M.",
			format: "private" as const,
			productId: insertedProducts[2].id,
			startingLevel: "b1" as const,
			currentLevel: "b1_plus" as const,
			startDate: "2024-02-15",
			cohortStatus: "enrollment_closed" as const,
			roomType: "for_one_to_one" as const,
			maxStudents: 1,
			setupFinalized: true,
		},
		{
			title: "Kids Saturday Morning French",
			format: "group" as const,
			productId: insertedProducts[5].id,
			startingLevel: "a1" as const,
			currentLevel: "a1" as const,
			startDate: "2024-09-07",
			cohortStatus: "enrollment_open" as const,
			roomType: "medium" as const,
			maxStudents: 8,
			setupFinalized: false,
		},
		{
			title: "DELF B2 Preparation Fall 2024",
			format: "group" as const,
			productId: insertedProducts[4].id,
			startingLevel: "b2" as const,
			currentLevel: "b2" as const,
			startDate: "2024-09-15",
			cohortStatus: "enrollment_open" as const,
			roomType: "medium_plus" as const,
			maxStudents: 10,
			setupFinalized: false,
		},
	];
	
	const insertedCohorts = await db.insert(cohorts).values(cohortsData).returning();
	console.log(`✅ Inserted ${insertedCohorts.length} cohorts`);

	// Seed Weekly Sessions
	console.log("📅 Seeding weekly sessions...");
	const weeklySessionsData = [];
	for (const cohort of insertedCohorts) {
		// Add 2-3 weekly sessions per cohort
		const sessionCount = faker.number.int({ min: 2, max: 3 });
		const days = faker.helpers.arrayElements(
			["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const,
			sessionCount
		);
		
		for (const day of days) {
			const startHour = faker.number.int({ min: 9, max: 18 });
			const duration = faker.helpers.arrayElement([60, 90, 120]);
			const endHour = startHour + Math.floor(duration / 60);
			const endMinute = duration % 60;
			
			weeklySessionsData.push({
				cohortId: cohort.id,
				dayOfWeek: day,
				startTime: `${startHour.toString().padStart(2, '0')}:00:00`,
				endTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`,
				teacherId: faker.helpers.arrayElement(insertedTeachers).id,
				isActive: true,
			});
		}
	}
	
	const insertedWeeklySessions = await db.insert(weeklySessions).values(weeklySessionsData).returning();
	console.log(`✅ Inserted ${insertedWeeklySessions.length} weekly sessions`);

	// Seed Enrollments (150 - varied distribution)
	console.log("📝 Seeding enrollments...");
	const enrollmentsData = [];
	const enrollmentStatuses = [
		"interested",
		"beginner_form_filled",
		"contract_signed",
		"paid",
		"welcome_package_sent",
		"declined_contract",
		"dropped_out",
		"contract_abandoned",
		"payment_abandoned"
	] as const;
	
	// Ensure each cohort gets some enrollments
	for (const cohort of insertedCohorts) {
		const enrollmentCount = faker.number.int({ min: 10, max: 30 });
		const selectedStudents = faker.helpers.arrayElements(insertedStudents, enrollmentCount);
		
		for (const student of selectedStudents) {
			// Higher chance of active statuses
			const status = faker.helpers.weightedArrayElement([
				{ weight: 3, value: "paid" },
				{ weight: 2, value: "welcome_package_sent" },
				{ weight: 2, value: "contract_signed" },
				{ weight: 1, value: "interested" },
				{ weight: 1, value: "beginner_form_filled" },
				{ weight: 0.5, value: "dropped_out" },
				{ weight: 0.5, value: "declined_contract" },
				{ weight: 0.5, value: "contract_abandoned" },
				{ weight: 0.5, value: "payment_abandoned" },
			]);
			
			enrollmentsData.push({
				studentId: student.id,
				cohortId: cohort.id,
				status: status as any,
				enrollmentDate: faker.date.between({ 
					from: '2024-01-01', 
					to: '2024-03-01' 
				}).toISOString().split('T')[0],
			});
		}
	}
	
	const insertedEnrollments = await db.insert(enrollments).values(enrollmentsData).returning();
	console.log(`✅ Inserted ${insertedEnrollments.length} enrollments`);

	// Seed Template Follow-up Sequences
	console.log("📧 Seeding follow-up sequences...");
	const sequencesData = [
		{
			displayName: "New Student Welcome Series",
			subject: "Welcome to French Language Solutions!",
			firstFollowUpDelayMinutes: 30,
		},
		{
			displayName: "Payment Reminder Sequence",
			subject: "Gentle Payment Reminder",
			firstFollowUpDelayMinutes: 1440, // 24 hours
		},
		{
			displayName: "Re-engagement Campaign",
			subject: "We Miss You!",
			firstFollowUpDelayMinutes: 2880, // 48 hours
		},
		{
			displayName: "Birthday Wishes",
			subject: "Happy Birthday from FLS!",
			firstFollowUpDelayMinutes: 0,
		},
		{
			displayName: "Class Reminder Series",
			subject: "Upcoming Class Reminder",
			firstFollowUpDelayMinutes: 60,
		},
	];
	
	const insertedSequences = await db.insert(templateFollowUpSequences).values(sequencesData).returning();
	console.log(`✅ Inserted ${insertedSequences.length} follow-up sequences`);

	// Seed Template Follow-up Messages
	console.log("💌 Seeding follow-up messages...");
	const messagesData = [];
	
	for (const sequence of insertedSequences) {
		const messageCount = faker.number.int({ min: 3, max: 5 });
		
		for (let i = 0; i < messageCount; i++) {
			messagesData.push({
				sequenceId: sequence.id,
				stepIndex: i + 1,
				timeDelayHours: i * 24 * 3, // Every 3 days
				messageContent: faker.lorem.paragraphs(2),
				status: "active" as const,
			});
		}
	}
	
	const insertedMessages = await db.insert(templateFollowUpMessages).values(messagesData).returning();
	console.log(`✅ Inserted ${insertedMessages.length} follow-up messages`);

	// Seed Touchpoints
	console.log("🤝 Seeding touchpoints...");
	const touchpointsData = [];
	const touchpointChannels = ["call", "email", "sms", "whatsapp"] as const;
	const touchpointTypes = ["inbound", "outbound"] as const;
	
	// Create touchpoints for a subset of students
	const studentsWithTouchpoints = faker.helpers.arrayElements(insertedStudents, 30);
	
	for (const student of studentsWithTouchpoints) {
		const touchpointCount = faker.number.int({ min: 2, max: 8 });
		
		for (let i = 0; i < touchpointCount; i++) {
			const channel = faker.helpers.arrayElement(touchpointChannels);
			touchpointsData.push({
				studentId: student.id,
				channel: channel,
				type: faker.helpers.arrayElement(touchpointTypes),
				message: faker.lorem.sentence(),
				source: "manual" as const,
				occurredAt: faker.date.recent({ days: 60 }),
			});
		}
	}
	
	const insertedTouchpoints = await db.insert(touchpoints).values(touchpointsData).returning();
	console.log(`✅ Inserted ${insertedTouchpoints.length} touchpoints`);

	// Seed Student Assessments
	console.log("📊 Seeding student assessments...");
	const assessmentsData = [];
	
	// Create assessments for students with "paid" or "welcome_package_sent" status
	const activeEnrollments = insertedEnrollments.filter(e => 
		e.status === "paid" || e.status === "welcome_package_sent"
	);
	
	for (const enrollment of activeEnrollments.slice(0, 30)) {
		const assessmentCount = faker.number.int({ min: 1, max: 3 });
		
		for (let i = 0; i < assessmentCount; i++) {
			assessmentsData.push({
				studentId: enrollment.studentId,
				assessmentType: faker.helpers.arrayElement([
					"placement_test",
					"progress_test",
					"final_exam",
					"oral_assessment",
					"written_assessment"
				] as const),
				score: faker.number.int({ min: 60, max: 100 }),
				maxScore: 100,
				assessmentDate: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
				notes: faker.lorem.sentence(),
				assessedBy: faker.helpers.arrayElement(insertedTeachers).id,
			});
		}
	}
	
	const insertedAssessments = await db.insert(studentAssessments).values(assessmentsData).returning();
	console.log(`✅ Inserted ${insertedAssessments.length} student assessments`);

	// Seed Attendance Records
	console.log("📋 Seeding attendance records...");
	const attendanceData = [];
	
	// Create some classes first (we'll need them for attendance)
	const classesData = [];
	for (const cohort of insertedCohorts.slice(0, 3)) {
		const classCount = faker.number.int({ min: 5, max: 10 });
		
		for (let i = 0; i < classCount; i++) {
			const classDate = faker.date.recent({ days: 30 });
			const startTime = new Date(classDate);
			startTime.setHours(faker.number.int({ min: 9, max: 18 }), 0, 0, 0);
			const endTime = new Date(startTime);
			endTime.setHours(startTime.getHours() + 2);
			
			classesData.push({
				cohortId: cohort.id,
				name: `Class ${i + 1} - ${cohort.title}`,
				description: faker.lorem.sentence(),
				startTime: startTime,
				endTime: endTime,
				status: faker.helpers.arrayElement(["scheduled", "in_progress", "completed", "cancelled"] as const),
				teacherId: faker.helpers.arrayElement(insertedTeachers).id,
				room: faker.helpers.arrayElement(["Room A", "Room B", "Online", null]),
				meetingLink: faker.datatype.boolean() ? faker.internet.url() : null,
				currentEnrollment: faker.number.int({ min: 5, max: 15 }),
			});
		}
	}
	
	const insertedClasses = await db.insert(classes).values(classesData).returning();
	console.log(`✅ Inserted ${insertedClasses.length} classes`);
	
	// Now create attendance records
	for (const classItem of insertedClasses) {
		// Get enrollments for this cohort
		const cohortEnrollments = insertedEnrollments.filter(e => 
			e.cohortId === classItem.cohortId && 
			(e.status === "paid" || e.status === "welcome_package_sent")
		);
		
		// Create attendance for most enrolled students
		const attendingStudents = faker.helpers.arrayElements(
			cohortEnrollments, 
			Math.min(cohortEnrollments.length, faker.number.int({ min: 5, max: 12 }))
		);
		
		for (const enrollment of attendingStudents) {
			const statusOptions = faker.helpers.weightedArrayElement([
				{ weight: 7, value: "attended" },
				{ weight: 2, value: "not_attended" },
				{ weight: 1, value: "unset" },
			]);
			
			attendanceData.push({
				classId: classItem.id,
				studentId: enrollment.studentId,
				cohortId: classItem.cohortId,
				attendanceDate: classItem.startTime.toISOString().split('T')[0],
				status: statusOptions as any,
				notes: faker.datatype.boolean() ? faker.lorem.sentence() : null,
			});
		}
	}
	
	const insertedAttendance = await db.insert(attendanceRecords).values(attendanceData).returning();
	console.log(`✅ Inserted ${insertedAttendance.length} attendance records`);

	console.log("\n✨ Seed completed successfully!");
	console.log(`
📊 Summary:
- ${insertedStudents.length} students
- ${insertedTeachers.length} teachers  
- ${insertedProducts.length} products
- ${insertedCohorts.length} cohorts (with max_students and setup_finalized)
- ${insertedWeeklySessions.length} weekly sessions
- ${insertedEnrollments.length} enrollments
- ${insertedSequences.length} follow-up sequences
- ${insertedMessages.length} follow-up messages
- ${insertedTouchpoints.length} touchpoints
- ${insertedAssessments.length} student assessments
- ${insertedClasses.length} classes
- ${insertedAttendance.length} attendance records
- Fresh seed completed
	`);
}

// Run the seed function
seed()
	.then(() => {
		console.log("🎉 Database seeded successfully");
		process.exit(0);
	})
	.catch((error) => {
		console.error("❌ Error seeding database:", error);
		process.exit(1);
	});