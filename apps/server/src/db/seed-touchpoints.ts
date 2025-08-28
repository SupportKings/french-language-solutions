import { faker } from "@faker-js/faker";
import { db } from "./index";
import { automatedFollowUps, students, touchpoints } from "./schema";

async function seedTouchpoints() {
	console.log("🌱 Starting touchpoints seed...");

	// Get existing students and automated follow-ups to link to
	const existingStudents = await db.select().from(students);
	const existingAutomatedFollowUps = await db.select().from(automatedFollowUps);

	if (existingStudents.length === 0) {
		console.log("❌ No students found. Please run the main seed first.");
		return;
	}

	// Only clear touchpoints data
	await db.delete(touchpoints);
	console.log("🗑️ Cleared existing touchpoints");

	// Seed Touchpoints (50)
	const touchpointsData = Array.from({ length: 50 }, () => {
		const occurredAt = faker.date.recent({ days: 30 });
		const automatedFollowUp =
			faker.datatype.boolean({ probability: 0.3 }) &&
			existingAutomatedFollowUps.length > 0
				? faker.helpers.arrayElement(existingAutomatedFollowUps)
				: null;

		return {
			studentId: faker.helpers.arrayElement(existingStudents).id,
			channel: faker.helpers.arrayElement([
				"sms",
				"call",
				"whatsapp",
				"email",
			] as const),
			type: faker.helpers.arrayElement(["inbound", "outbound"] as const),
			message: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
			source: faker.helpers.arrayElement([
				"manual",
				"automated",
				"openphone",
				"gmail",
				"whatsapp_business",
			] as const),
			automatedFollowUpId: automatedFollowUp?.id || null,
			externalId: faker.datatype.boolean({ probability: 0.4 })
				? faker.string.uuid()
				: null,
			externalMetadata: faker.datatype.boolean({ probability: 0.3 })
				? JSON.stringify({
						phoneNumber: "+1" + faker.string.numeric(10),
						platform: faker.helpers.arrayElement([
							"openphone",
							"gmail",
							"whatsapp",
						]),
						messageId: faker.string.alphanumeric(12),
					})
				: null,
			occurredAt,
		};
	});

	const insertedTouchpoints = await db
		.insert(touchpoints)
		.values(touchpointsData)
		.returning();
	console.log(`✅ Inserted ${insertedTouchpoints.length} touchpoints`);

	console.log("✨ Touchpoints seed completed successfully!");
}

// Run the seed
seedTouchpoints()
	.catch((error) => {
		console.error("❌ Touchpoints seed failed:", error);
		process.exit(1);
	})
	.finally(() => {
		process.exit(0);
	});
