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
	languageLevels,
	touchpoints
} from "./schema";
import { faker } from "@faker-js/faker";

async function seed() {
	console.log("🌱 Starting seed...");

	// Clear existing data (in reverse order of dependencies)
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
	await db.delete(languageLevels);

	// Seed Language Levels (73 levels)
	const languageLevelsData = [
		// A0 - Complete Beginner
		{ code: 'a0', displayName: 'A0 - Complete Beginner', levelGroup: 'a0', levelNumber: null },
		
		// A1 Levels (1-12)
		{ code: 'a1.1', displayName: 'A1.1', levelGroup: 'a1', levelNumber: 1 },
		{ code: 'a1.2', displayName: 'A1.2', levelGroup: 'a1', levelNumber: 2 },
		{ code: 'a1.3', displayName: 'A1.3', levelGroup: 'a1', levelNumber: 3 },
		{ code: 'a1.4', displayName: 'A1.4', levelGroup: 'a1', levelNumber: 4 },
		{ code: 'a1.5', displayName: 'A1.5', levelGroup: 'a1', levelNumber: 5 },
		{ code: 'a1.6', displayName: 'A1.6', levelGroup: 'a1', levelNumber: 6 },
		{ code: 'a1.7', displayName: 'A1.7', levelGroup: 'a1', levelNumber: 7 },
		{ code: 'a1.8', displayName: 'A1.8', levelGroup: 'a1', levelNumber: 8 },
		{ code: 'a1.9', displayName: 'A1.9', levelGroup: 'a1', levelNumber: 9 },
		{ code: 'a1.10', displayName: 'A1.10', levelGroup: 'a1', levelNumber: 10 },
		{ code: 'a1.11', displayName: 'A1.11', levelGroup: 'a1', levelNumber: 11 },
		{ code: 'a1.12', displayName: 'A1.12', levelGroup: 'a1', levelNumber: 12 },
		
		// A2 Levels (1-12)
		{ code: 'a2.1', displayName: 'A2.1', levelGroup: 'a2', levelNumber: 1 },
		{ code: 'a2.2', displayName: 'A2.2', levelGroup: 'a2', levelNumber: 2 },
		{ code: 'a2.3', displayName: 'A2.3', levelGroup: 'a2', levelNumber: 3 },
		{ code: 'a2.4', displayName: 'A2.4', levelGroup: 'a2', levelNumber: 4 },
		{ code: 'a2.5', displayName: 'A2.5', levelGroup: 'a2', levelNumber: 5 },
		{ code: 'a2.6', displayName: 'A2.6', levelGroup: 'a2', levelNumber: 6 },
		{ code: 'a2.7', displayName: 'A2.7', levelGroup: 'a2', levelNumber: 7 },
		{ code: 'a2.8', displayName: 'A2.8', levelGroup: 'a2', levelNumber: 8 },
		{ code: 'a2.9', displayName: 'A2.9', levelGroup: 'a2', levelNumber: 9 },
		{ code: 'a2.10', displayName: 'A2.10', levelGroup: 'a2', levelNumber: 10 },
		{ code: 'a2.11', displayName: 'A2.11', levelGroup: 'a2', levelNumber: 11 },
		{ code: 'a2.12', displayName: 'A2.12', levelGroup: 'a2', levelNumber: 12 },
		
		// B1 Levels (1-12)
		{ code: 'b1.1', displayName: 'B1.1', levelGroup: 'b1', levelNumber: 1 },
		{ code: 'b1.2', displayName: 'B1.2', levelGroup: 'b1', levelNumber: 2 },
		{ code: 'b1.3', displayName: 'B1.3', levelGroup: 'b1', levelNumber: 3 },
		{ code: 'b1.4', displayName: 'B1.4', levelGroup: 'b1', levelNumber: 4 },
		{ code: 'b1.5', displayName: 'B1.5', levelGroup: 'b1', levelNumber: 5 },
		{ code: 'b1.6', displayName: 'B1.6', levelGroup: 'b1', levelNumber: 6 },
		{ code: 'b1.7', displayName: 'B1.7', levelGroup: 'b1', levelNumber: 7 },
		{ code: 'b1.8', displayName: 'B1.8', levelGroup: 'b1', levelNumber: 8 },
		{ code: 'b1.9', displayName: 'B1.9', levelGroup: 'b1', levelNumber: 9 },
		{ code: 'b1.10', displayName: 'B1.10', levelGroup: 'b1', levelNumber: 10 },
		{ code: 'b1.11', displayName: 'B1.11', levelGroup: 'b1', levelNumber: 11 },
		{ code: 'b1.12', displayName: 'B1.12', levelGroup: 'b1', levelNumber: 12 },
		
		// B2 Levels (1-12)
		{ code: 'b2.1', displayName: 'B2.1', levelGroup: 'b2', levelNumber: 1 },
		{ code: 'b2.2', displayName: 'B2.2', levelGroup: 'b2', levelNumber: 2 },
		{ code: 'b2.3', displayName: 'B2.3', levelGroup: 'b2', levelNumber: 3 },
		{ code: 'b2.4', displayName: 'B2.4', levelGroup: 'b2', levelNumber: 4 },
		{ code: 'b2.5', displayName: 'B2.5', levelGroup: 'b2', levelNumber: 5 },
		{ code: 'b2.6', displayName: 'B2.6', levelGroup: 'b2', levelNumber: 6 },
		{ code: 'b2.7', displayName: 'B2.7', levelGroup: 'b2', levelNumber: 7 },
		{ code: 'b2.8', displayName: 'B2.8', levelGroup: 'b2', levelNumber: 8 },
		{ code: 'b2.9', displayName: 'B2.9', levelGroup: 'b2', levelNumber: 9 },
		{ code: 'b2.10', displayName: 'B2.10', levelGroup: 'b2', levelNumber: 10 },
		{ code: 'b2.11', displayName: 'B2.11', levelGroup: 'b2', levelNumber: 11 },
		{ code: 'b2.12', displayName: 'B2.12', levelGroup: 'b2', levelNumber: 12 },
		
		// C1 Levels (1-12)
		{ code: 'c1.1', displayName: 'C1.1', levelGroup: 'c1', levelNumber: 1 },
		{ code: 'c1.2', displayName: 'C1.2', levelGroup: 'c1', levelNumber: 2 },
		{ code: 'c1.3', displayName: 'C1.3', levelGroup: 'c1', levelNumber: 3 },
		{ code: 'c1.4', displayName: 'C1.4', levelGroup: 'c1', levelNumber: 4 },
		{ code: 'c1.5', displayName: 'C1.5', levelGroup: 'c1', levelNumber: 5 },
		{ code: 'c1.6', displayName: 'C1.6', levelGroup: 'c1', levelNumber: 6 },
		{ code: 'c1.7', displayName: 'C1.7', levelGroup: 'c1', levelNumber: 7 },
		{ code: 'c1.8', displayName: 'C1.8', levelGroup: 'c1', levelNumber: 8 },
		{ code: 'c1.9', displayName: 'C1.9', levelGroup: 'c1', levelNumber: 9 },
		{ code: 'c1.10', displayName: 'C1.10', levelGroup: 'c1', levelNumber: 10 },
		{ code: 'c1.11', displayName: 'C1.11', levelGroup: 'c1', levelNumber: 11 },
		{ code: 'c1.12', displayName: 'C1.12', levelGroup: 'c1', levelNumber: 12 },
		
		// C2 Levels (1-12)
		{ code: 'c2.1', displayName: 'C2.1', levelGroup: 'c2', levelNumber: 1 },
		{ code: 'c2.2', displayName: 'C2.2', levelGroup: 'c2', levelNumber: 2 },
		{ code: 'c2.3', displayName: 'C2.3', levelGroup: 'c2', levelNumber: 3 },
		{ code: 'c2.4', displayName: 'C2.4', levelGroup: 'c2', levelNumber: 4 },
		{ code: 'c2.5', displayName: 'C2.5', levelGroup: 'c2', levelNumber: 5 },
		{ code: 'c2.6', displayName: 'C2.6', levelGroup: 'c2', levelNumber: 6 },
		{ code: 'c2.7', displayName: 'C2.7', levelGroup: 'c2', levelNumber: 7 },
		{ code: 'c2.8', displayName: 'C2.8', levelGroup: 'c2', levelNumber: 8 },
		{ code: 'c2.9', displayName: 'C2.9', levelGroup: 'c2', levelNumber: 9 },
		{ code: 'c2.10', displayName: 'C2.10', levelGroup: 'c2', levelNumber: 10 },
		{ code: 'c2.11', displayName: 'C2.11', levelGroup: 'c2', levelNumber: 11 },
		{ code: 'c2.12', displayName: 'C2.12', levelGroup: 'c2', levelNumber: 12 },
	];

	const insertedLanguageLevels = await db.insert(languageLevels).values(languageLevelsData).returning();
	console.log(`✅ Inserted ${insertedLanguageLevels.length} language levels`);

	// Seed Students (50)
	const studentsData = Array.from({ length: 50 }, () => ({
		fullName: faker.person.fullName(),
		email: faker.internet.email().toLowerCase(),
		mobilePhoneNumber: "+1" + faker.string.numeric(10), // Proper phone format
		city: faker.location.city(),
		desiredStartingLanguageLevelId: faker.helpers.arrayElement(insertedLanguageLevels).id,
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
		productId: faker.helpers.arrayElement(insertedProducts).id,
		startingLevelId: faker.helpers.arrayElement(insertedLanguageLevels).id,
		startDate: faker.date.future({ years: 0.5 }).toISOString().split('T')[0],
		cohortStatus: faker.helpers.arrayElement(["enrollment_open", "enrollment_closed", "class_ended"] as const),
		currentLevelId: faker.helpers.arrayElement(insertedLanguageLevels).id,
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
	const classesData = Array.from({ length: 50 }, () => {
		const startTime = faker.date.future({ years: 0.25 });
		const endTime = new Date(startTime.getTime() + 90 * 60000); // 90 minutes later
		
		return {
			cohortId: faker.helpers.arrayElement(insertedCohorts).id,
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
		levelId: faker.helpers.arrayElement(insertedLanguageLevels).id,
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