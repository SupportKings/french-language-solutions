import { db } from "./index";
import { templateFollowUpSequences } from "./schema";
import { eq } from "drizzle-orm";

async function seedSequences() {
	try {
		console.log("🌱 Starting sequences seed...");

		// Check if sequences already exist
		const existingSequences = await db.select().from(templateFollowUpSequences);
		
		if (existingSequences.length > 0) {
			console.log(`✅ Sequences already exist (${existingSequences.length} found). Skipping seed.`);
			return;
		}

		// Seed template follow-up sequences
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
			{
				displayName: "Payment Follow-up",
				subject: "Complete Your Enrollment",
				firstFollowUpDelayMinutes: 60, // 1 hour
			},
			{
				displayName: "Course Start Reminder",
				subject: "Your French Course Starts Soon!",
				firstFollowUpDelayMinutes: 2880, // 48 hours
			},
		];

		const insertedSequences = await db.insert(templateFollowUpSequences).values(sequencesData).returning();
		console.log(`✅ Inserted ${insertedSequences.length} follow-up sequences`);

		console.log("✅ Sequences seed completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("❌ Sequences seed failed:", error);
		process.exit(1);
	}
}

seedSequences();