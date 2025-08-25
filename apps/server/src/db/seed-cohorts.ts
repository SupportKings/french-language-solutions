import { db } from "./index";
import { cohorts } from "./schema/cohorts";
import { products } from "./schema/products";

async function seedCohorts() {
	console.log("Starting cohort seeding...");

	try {
		// Get existing products
		const existingProducts = await db.select().from(products).limit(3);
		
		if (existingProducts.length === 0) {
			console.log("No products found. Please seed products first.");
			return;
		}

		// Sample cohorts with titles
		const sampleCohorts = [
			{
				title: "Spring 2024 Beginner French",
				format: "group" as const,
				productId: existingProducts[0]?.id,
				startingLevel: "a1" as const,
				currentLevel: "a1" as const,
				startDate: "2024-03-01",
				cohortStatus: "enrollment_closed" as const,
				roomType: "for_one_to_one" as const,
			},
			{
				title: "Advanced Business French - Q2 2024",
				format: "group" as const,
				productId: existingProducts[1]?.id,
				startingLevel: "b2" as const,
				currentLevel: "c1" as const,
				startDate: "2024-04-15",
				cohortStatus: "enrollment_closed" as const,
				roomType: "medium" as const,
			},
			{
				title: "Summer Intensive French A2",
				format: "group" as const,
				productId: existingProducts[2]?.id,
				startingLevel: "a2" as const,
				currentLevel: "a2" as const,
				startDate: "2024-06-01",
				cohortStatus: "enrollment_open" as const,
				roomType: "medium_plus" as const,
			},
			{
				title: "Fall 2024 Intermediate Conversational",
				format: "group" as const,
				productId: existingProducts[0]?.id,
				startingLevel: "b1" as const,
				currentLevel: "b1" as const,
				startDate: "2024-09-01",
				cohortStatus: "enrollment_open" as const,
				roomType: "large" as const,
			},
			{
				title: "Winter French for Professionals",
				format: "private" as const,
				productId: existingProducts[1]?.id,
				startingLevel: "b1" as const,
				currentLevel: "b2" as const,
				startDate: "2024-01-15",
				cohortStatus: "class_ended" as const,
				roomType: "for_one_to_one" as const,
			},
		];

		// Insert cohorts
		const insertedCohorts = await db
			.insert(cohorts)
			.values(sampleCohorts)
			.returning();

		console.log(`Successfully seeded ${insertedCohorts.length} cohorts with titles`);
		
		return insertedCohorts;
	} catch (error) {
		console.error("Error seeding cohorts:", error);
		throw error;
	}
}

// Run the seed function if this file is executed directly
if (require.main === module) {
	seedCohorts()
		.then(() => {
			console.log("Cohort seeding completed");
			process.exit(0);
		})
		.catch((error) => {
			console.error("Cohort seeding failed:", error);
			process.exit(1);
		});
}

export { seedCohorts };