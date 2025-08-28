import { db } from "../index";
import { languageLevels } from "../schema/language-levels";

async function seedLanguageLevels() {
  console.log("🌱 Seeding language levels...");

  const levels = [
    // A0 - Complete Beginner
    { code: 'a0', displayName: 'A0 - Complete Beginner', levelGroup: 'a0', levelNumber: null },
    
    // A1 Levels (1-12)
    { code: 'a1.1', displayName: 'A1.1 - Beginner Level 1', levelGroup: 'a1', levelNumber: 1 },
    { code: 'a1.2', displayName: 'A1.2 - Beginner Level 2', levelGroup: 'a1', levelNumber: 2 },
    { code: 'a1.3', displayName: 'A1.3 - Beginner Level 3', levelGroup: 'a1', levelNumber: 3 },
    { code: 'a1.4', displayName: 'A1.4 - Beginner Level 4', levelGroup: 'a1', levelNumber: 4 },
    { code: 'a1.5', displayName: 'A1.5 - Beginner Level 5', levelGroup: 'a1', levelNumber: 5 },
    { code: 'a1.6', displayName: 'A1.6 - Beginner Level 6', levelGroup: 'a1', levelNumber: 6 },
    { code: 'a1.7', displayName: 'A1.7 - Beginner Level 7', levelGroup: 'a1', levelNumber: 7 },
    { code: 'a1.8', displayName: 'A1.8 - Beginner Level 8', levelGroup: 'a1', levelNumber: 8 },
    { code: 'a1.9', displayName: 'A1.9 - Beginner Level 9', levelGroup: 'a1', levelNumber: 9 },
    { code: 'a1.10', displayName: 'A1.10 - Beginner Level 10', levelGroup: 'a1', levelNumber: 10 },
    { code: 'a1.11', displayName: 'A1.11 - Beginner Level 11', levelGroup: 'a1', levelNumber: 11 },
    { code: 'a1.12', displayName: 'A1.12 - Beginner Level 12', levelGroup: 'a1', levelNumber: 12 },
    
    // A2 Levels (1-12)
    { code: 'a2.1', displayName: 'A2.1 - Elementary Level 1', levelGroup: 'a2', levelNumber: 1 },
    { code: 'a2.2', displayName: 'A2.2 - Elementary Level 2', levelGroup: 'a2', levelNumber: 2 },
    { code: 'a2.3', displayName: 'A2.3 - Elementary Level 3', levelGroup: 'a2', levelNumber: 3 },
    { code: 'a2.4', displayName: 'A2.4 - Elementary Level 4', levelGroup: 'a2', levelNumber: 4 },
    { code: 'a2.5', displayName: 'A2.5 - Elementary Level 5', levelGroup: 'a2', levelNumber: 5 },
    { code: 'a2.6', displayName: 'A2.6 - Elementary Level 6', levelGroup: 'a2', levelNumber: 6 },
    { code: 'a2.7', displayName: 'A2.7 - Elementary Level 7', levelGroup: 'a2', levelNumber: 7 },
    { code: 'a2.8', displayName: 'A2.8 - Elementary Level 8', levelGroup: 'a2', levelNumber: 8 },
    { code: 'a2.9', displayName: 'A2.9 - Elementary Level 9', levelGroup: 'a2', levelNumber: 9 },
    { code: 'a2.10', displayName: 'A2.10 - Elementary Level 10', levelGroup: 'a2', levelNumber: 10 },
    { code: 'a2.11', displayName: 'A2.11 - Elementary Level 11', levelGroup: 'a2', levelNumber: 11 },
    { code: 'a2.12', displayName: 'A2.12 - Elementary Level 12', levelGroup: 'a2', levelNumber: 12 },
    
    // B1 Levels (1-12)
    { code: 'b1.1', displayName: 'B1.1 - Intermediate Level 1', levelGroup: 'b1', levelNumber: 1 },
    { code: 'b1.2', displayName: 'B1.2 - Intermediate Level 2', levelGroup: 'b1', levelNumber: 2 },
    { code: 'b1.3', displayName: 'B1.3 - Intermediate Level 3', levelGroup: 'b1', levelNumber: 3 },
    { code: 'b1.4', displayName: 'B1.4 - Intermediate Level 4', levelGroup: 'b1', levelNumber: 4 },
    { code: 'b1.5', displayName: 'B1.5 - Intermediate Level 5', levelGroup: 'b1', levelNumber: 5 },
    { code: 'b1.6', displayName: 'B1.6 - Intermediate Level 6', levelGroup: 'b1', levelNumber: 6 },
    { code: 'b1.7', displayName: 'B1.7 - Intermediate Level 7', levelGroup: 'b1', levelNumber: 7 },
    { code: 'b1.8', displayName: 'B1.8 - Intermediate Level 8', levelGroup: 'b1', levelNumber: 8 },
    { code: 'b1.9', displayName: 'B1.9 - Intermediate Level 9', levelGroup: 'b1', levelNumber: 9 },
    { code: 'b1.10', displayName: 'B1.10 - Intermediate Level 10', levelGroup: 'b1', levelNumber: 10 },
    { code: 'b1.11', displayName: 'B1.11 - Intermediate Level 11', levelGroup: 'b1', levelNumber: 11 },
    { code: 'b1.12', displayName: 'B1.12 - Intermediate Level 12', levelGroup: 'b1', levelNumber: 12 },
    
    // B2 Levels (1-12)
    { code: 'b2.1', displayName: 'B2.1 - Upper Intermediate Level 1', levelGroup: 'b2', levelNumber: 1 },
    { code: 'b2.2', displayName: 'B2.2 - Upper Intermediate Level 2', levelGroup: 'b2', levelNumber: 2 },
    { code: 'b2.3', displayName: 'B2.3 - Upper Intermediate Level 3', levelGroup: 'b2', levelNumber: 3 },
    { code: 'b2.4', displayName: 'B2.4 - Upper Intermediate Level 4', levelGroup: 'b2', levelNumber: 4 },
    { code: 'b2.5', displayName: 'B2.5 - Upper Intermediate Level 5', levelGroup: 'b2', levelNumber: 5 },
    { code: 'b2.6', displayName: 'B2.6 - Upper Intermediate Level 6', levelGroup: 'b2', levelNumber: 6 },
    { code: 'b2.7', displayName: 'B2.7 - Upper Intermediate Level 7', levelGroup: 'b2', levelNumber: 7 },
    { code: 'b2.8', displayName: 'B2.8 - Upper Intermediate Level 8', levelGroup: 'b2', levelNumber: 8 },
    { code: 'b2.9', displayName: 'B2.9 - Upper Intermediate Level 9', levelGroup: 'b2', levelNumber: 9 },
    { code: 'b2.10', displayName: 'B2.10 - Upper Intermediate Level 10', levelGroup: 'b2', levelNumber: 10 },
    { code: 'b2.11', displayName: 'B2.11 - Upper Intermediate Level 11', levelGroup: 'b2', levelNumber: 11 },
    { code: 'b2.12', displayName: 'B2.12 - Upper Intermediate Level 12', levelGroup: 'b2', levelNumber: 12 },
    
    // C1 Levels (1-12)
    { code: 'c1.1', displayName: 'C1.1 - Advanced Level 1', levelGroup: 'c1', levelNumber: 1 },
    { code: 'c1.2', displayName: 'C1.2 - Advanced Level 2', levelGroup: 'c1', levelNumber: 2 },
    { code: 'c1.3', displayName: 'C1.3 - Advanced Level 3', levelGroup: 'c1', levelNumber: 3 },
    { code: 'c1.4', displayName: 'C1.4 - Advanced Level 4', levelGroup: 'c1', levelNumber: 4 },
    { code: 'c1.5', displayName: 'C1.5 - Advanced Level 5', levelGroup: 'c1', levelNumber: 5 },
    { code: 'c1.6', displayName: 'C1.6 - Advanced Level 6', levelGroup: 'c1', levelNumber: 6 },
    { code: 'c1.7', displayName: 'C1.7 - Advanced Level 7', levelGroup: 'c1', levelNumber: 7 },
    { code: 'c1.8', displayName: 'C1.8 - Advanced Level 8', levelGroup: 'c1', levelNumber: 8 },
    { code: 'c1.9', displayName: 'C1.9 - Advanced Level 9', levelGroup: 'c1', levelNumber: 9 },
    { code: 'c1.10', displayName: 'C1.10 - Advanced Level 10', levelGroup: 'c1', levelNumber: 10 },
    { code: 'c1.11', displayName: 'C1.11 - Advanced Level 11', levelGroup: 'c1', levelNumber: 11 },
    { code: 'c1.12', displayName: 'C1.12 - Advanced Level 12', levelGroup: 'c1', levelNumber: 12 },
    
    // C2 Levels (1-12)
    { code: 'c2.1', displayName: 'C2.1 - Proficient Level 1', levelGroup: 'c2', levelNumber: 1 },
    { code: 'c2.2', displayName: 'C2.2 - Proficient Level 2', levelGroup: 'c2', levelNumber: 2 },
    { code: 'c2.3', displayName: 'C2.3 - Proficient Level 3', levelGroup: 'c2', levelNumber: 3 },
    { code: 'c2.4', displayName: 'C2.4 - Proficient Level 4', levelGroup: 'c2', levelNumber: 4 },
    { code: 'c2.5', displayName: 'C2.5 - Proficient Level 5', levelGroup: 'c2', levelNumber: 5 },
    { code: 'c2.6', displayName: 'C2.6 - Proficient Level 6', levelGroup: 'c2', levelNumber: 6 },
    { code: 'c2.7', displayName: 'C2.7 - Proficient Level 7', levelGroup: 'c2', levelNumber: 7 },
    { code: 'c2.8', displayName: 'C2.8 - Proficient Level 8', levelGroup: 'c2', levelNumber: 8 },
    { code: 'c2.9', displayName: 'C2.9 - Proficient Level 9', levelGroup: 'c2', levelNumber: 9 },
    { code: 'c2.10', displayName: 'C2.10 - Proficient Level 10', levelGroup: 'c2', levelNumber: 10 },
    { code: 'c2.11', displayName: 'C2.11 - Proficient Level 11', levelGroup: 'c2', levelNumber: 11 },
    { code: 'c2.12', displayName: 'C2.12 - Proficient Level 12', levelGroup: 'c2', levelNumber: 12 },
  ];

  try {
    // Insert all language levels
    for (const level of levels) {
      await db.insert(languageLevels)
        .values(level)
        .onConflictDoNothing(); // Skip if already exists
    }

    console.log(`✅ Successfully seeded ${levels.length} language levels`);
  } catch (error) {
    console.error("❌ Error seeding language levels:", error);
    throw error;
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedLanguageLevels()
    .then(() => {
      console.log("✨ Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}

export { seedLanguageLevels };