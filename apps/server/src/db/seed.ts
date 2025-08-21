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
	touchpoints
} from "./schema";
import { faker } from "@faker-js/faker";

async function seed() {
	console.log("🌱 Starting seed...");

	// Clear existing data (in reverse order of dependencies)
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

	// Seed Students (50)
	const studentsData = Array.from({ length: 50 }, () => ({
		fullName: faker.person.fullName(),
		email: faker.internet.email().toLowerCase(),
		mobilePhoneNumber: "+1" + faker.string.numeric(10), // Proper phone format
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
			"Family connections"
		]),
		addedToEmailNewsletter: faker.datatype.boolean(),
		isUnder16: faker.datatype.boolean({ probability: 0.1 }),
	}));

	const insertedStudents = await db.insert(students).values(studentsData).returning();
	console.log(`✅ Inserted ${insertedStudents.length} students`);

	// Seed Teachers (10)
	const teachersData = Array.from({ length: 10 }, () => ({
		firstName: faker.person.firstName(),
		lastName: faker.person.lastName(),
		mobilePhoneNumber: "+33" + faker.string.numeric(9),
		groupClassBonusTerms: faker.helpers.arrayElement(["per_student_per_hour", "per_hour"] as const),
		onboardingStatus: faker.helpers.arrayElement(["onboarded", "training_in_progress", "new"] as const),
		contractType: faker.helpers.arrayElement(["freelancer", "full_time"] as const),
		maximumHoursPerWeek: faker.number.int({ min: 20, max: 40 }),
		maximumHoursPerDay: faker.number.int({ min: 4, max: 8 }),
		qualifiedForUnder16: faker.datatype.boolean(),
		availableForBooking: true,
		availableForOnlineClasses: true,
		availableForInPersonClasses: faker.datatype.boolean(),
		adminNotes: faker.lorem.sentence(),
	}));

	const insertedTeachers = await db.insert(teachers).values(teachersData).returning();
	console.log(`✅ Inserted ${insertedTeachers.length} teachers`);

	// Seed Products (8)
	const productsData = [
		{ displayName: "Beginner French A1", location: "online" as const, format: "group" as const },
		{ displayName: "Beginner French A2", location: "online" as const, format: "group" as const },
		{ displayName: "Intermediate French B1", location: "online" as const, format: "group" as const },
		{ displayName: "Intermediate French B2", location: "online" as const, format: "group" as const },
		{ displayName: "Advanced French C1", location: "online" as const, format: "group" as const },
		{ displayName: "Private Tutoring", location: "online" as const, format: "private" as const },
		{ displayName: "Business French", location: "hybrid" as const, format: "group" as const },
		{ displayName: "Conversation Club", location: "in_person" as const, format: "group" as const },
	];

	const insertedProducts = await db.insert(products).values(productsData).returning();
	console.log(`✅ Inserted ${insertedProducts.length} products`);

	// Seed Cohorts (15)
	const cohortsData = Array.from({ length: 15 }, (_, i) => ({
		format: faker.helpers.arrayElement(["group", "private"] as const),
		productId: faker.helpers.arrayElement(insertedProducts).id,
		startingLevel: faker.helpers.arrayElement(["a1", "a2", "b1", "b2"] as const),
		startDate: faker.date.future({ years: 0.5 }).toISOString().split('T')[0],
		cohortStatus: faker.helpers.arrayElement(["enrollment_open", "enrollment_closed", "class_ended"] as const),
		currentLevel: faker.helpers.arrayElement(["a1", "a2", "b1", "b2", "c1"] as const),
		roomType: faker.helpers.arrayElement(["medium", "large", "for_one_to_one"] as const),
	}));

	const insertedCohorts = await db.insert(cohorts).values(cohortsData).returning();
	console.log(`✅ Inserted ${insertedCohorts.length} cohorts`);

	// Seed Weekly Sessions (30 - 2 per cohort)
	const weeklySessionsData = insertedCohorts.flatMap(cohort => [
		{
			cohortId: cohort.id,
			teacherId: faker.helpers.arrayElement(insertedTeachers).id,
			dayOfWeek: "monday" as const,
			startTime: "18:00",
			endTime: "19:30",
		},
		{
			cohortId: cohort.id,
			teacherId: faker.helpers.arrayElement(insertedTeachers).id,
			dayOfWeek: "wednesday" as const,
			startTime: "18:00",
			endTime: "19:30",
		}
	]);

	const insertedWeeklySessions = await db.insert(weeklySessions).values(weeklySessionsData).returning();
	console.log(`✅ Inserted ${insertedWeeklySessions.length} weekly sessions`);

	// Seed Enrollments (100)
	const enrollmentsData = Array.from({ length: 100 }, () => ({
		studentId: faker.helpers.arrayElement(insertedStudents).id,
		cohortId: faker.helpers.arrayElement(insertedCohorts).id,
		status: faker.helpers.arrayElement([
			"interested",
			"contract_signed",
			"paid",
			"welcome_package_sent"
		] as const),
	}));

	const insertedEnrollments = await db.insert(enrollments).values(enrollmentsData).returning();
	console.log(`✅ Inserted ${insertedEnrollments.length} enrollments`);

	// Seed Classes (50)
	const classesData = Array.from({ length: 50 }, (_, index) => {
		const startTime = faker.date.future({ years: 0.25 });
		const endTime = new Date(startTime.getTime() + 90 * 60000); // 90 minutes later
		const cohort = faker.helpers.arrayElement(insertedCohorts);
		
		return {
			cohortId: cohort.id,
			name: `Class ${index + 1} - Module ${(index % 10) + 1}`,
			startTime,
			endTime,
			room: faker.helpers.arrayElement(["Room A", "Room B", "Zoom Meeting 1", "Zoom Meeting 2"]),
		};
	});

	const insertedClasses = await db.insert(classes).values(classesData).returning();
	console.log(`✅ Inserted ${insertedClasses.length} classes`);

	// Seed Student Assessments (30)
	const assessmentsData = Array.from({ length: 30 }, () => ({
		studentId: faker.helpers.arrayElement(insertedStudents).id,
		level: faker.helpers.arrayElement(["a1", "a2", "b1", "b2", "c1"] as const),
		scheduledFor: faker.date.future({ years: 0.1 }).toISOString().split('T')[0],
		isPaid: faker.datatype.boolean(),
		result: faker.helpers.arrayElement(["requested", "scheduled", "session_held", "level_determined"] as const),
		notes: faker.lorem.paragraph(),
		interviewHeldBy: faker.helpers.arrayElement(insertedTeachers).id,
		levelCheckedBy: faker.helpers.arrayElement(insertedTeachers).id,
	}));

	const insertedAssessments = await db.insert(studentAssessments).values(assessmentsData).returning();
	console.log(`✅ Inserted ${insertedAssessments.length} assessments`);

	// Seed Follow-up Sequences (3)
	const sequencesData = [
		{
			displayName: "New Student Welcome",
			subject: "Welcome to French Language Solutions!",
			firstFollowUpDelayMinutes: 30,
		},
		{
			displayName: "Assessment Reminder",
			subject: "Your French Assessment is Coming Up",
			firstFollowUpDelayMinutes: 1440, // 24 hours
		},
		{
			displayName: "Re-engagement Campaign",
			subject: "We Miss You at FLS!",
			firstFollowUpDelayMinutes: 10080, // 1 week
		},
	];

	const insertedSequences = await db.insert(templateFollowUpSequences).values(sequencesData).returning();
	console.log(`✅ Inserted ${insertedSequences.length} follow-up sequences`);

	// Seed Follow-up Messages (9 - 3 per sequence)
	const messagesData = insertedSequences.flatMap((sequence, i) => [
		{
			sequenceId: sequence.id,
			stepIndex: 1,
			status: "active" as const,
			timeDelayHours: 0,
			messageContent: `Initial message for ${sequence.displayName}`,
		},
		{
			sequenceId: sequence.id,
			stepIndex: 2,
			status: "active" as const,
			timeDelayHours: 24,
			messageContent: `First follow-up for ${sequence.displayName}`,
		},
		{
			sequenceId: sequence.id,
			stepIndex: 3,
			status: "active" as const,
			timeDelayHours: 72,
			messageContent: `Final follow-up for ${sequence.displayName}`,
		},
	]);

	const insertedMessages = await db.insert(templateFollowUpMessages).values(messagesData).returning();
	console.log(`✅ Inserted ${insertedMessages.length} follow-up messages`);

	// Seed Automated Follow-ups (20)
	const automatedData = Array.from({ length: 20 }, () => ({
		studentId: faker.helpers.arrayElement(insertedStudents).id,
		sequenceId: faker.helpers.arrayElement(insertedSequences).id,
		status: faker.helpers.arrayElement(["activated", "ongoing", "answer_received", "disabled"] as const),
		startedAt: faker.date.recent({ days: 30 }),
	}));

	const insertedAutomated = await db.insert(automatedFollowUps).values(automatedData).returning();
	console.log(`✅ Inserted ${insertedAutomated.length} automated follow-ups`);

	// Seed Touchpoints (50)
	const touchpointsData = Array.from({ length: 50 }, () => {
		const occurredAt = faker.date.recent({ days: 30 });
		const automatedFollowUp = faker.datatype.boolean({ probability: 0.3 }) ? faker.helpers.arrayElement(insertedAutomated) : null;
		
		return {
			studentId: faker.helpers.arrayElement(insertedStudents).id,
			channel: faker.helpers.arrayElement(["sms", "call", "whatsapp", "email"] as const),
			type: faker.helpers.arrayElement(["inbound", "outbound"] as const),
			message: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
			source: faker.helpers.arrayElement(["manual", "automated", "openphone", "gmail", "whatsapp_business"] as const),
			automatedFollowUpId: automatedFollowUp?.id || null,
			externalId: faker.datatype.boolean({ probability: 0.4 }) ? faker.string.uuid() : null,
			externalMetadata: faker.datatype.boolean({ probability: 0.3 }) ? JSON.stringify({
				phoneNumber: "+1" + faker.string.numeric(10),
				platform: faker.helpers.arrayElement(["openphone", "gmail", "whatsapp"]),
				messageId: faker.string.alphanumeric(12)
			}) : null,
			occurredAt,
		};
	});

	const insertedTouchpoints = await db.insert(touchpoints).values(touchpointsData).returning();
	console.log(`✅ Inserted ${insertedTouchpoints.length} touchpoints`);

	console.log("✨ Seed completed successfully!");
}

// Run the seed
seed()
	.catch((error) => {
		console.error("❌ Seed failed:", error);
		process.exit(1);
	})
	.finally(() => {
		process.exit(0);
	});