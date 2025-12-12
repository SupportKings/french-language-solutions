// Script to populate language_levels table
// Run with: node scripts/populate-language-levels.js

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
	console.error(
		"Missing Supabase credentials. Please check your .env.local file",
	);
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const languageLevels = [
	// A0 - Complete Beginner
	{
		code: "a0",
		display_name: "A0 - Complete Beginner",
		level_group: "a0",
		level_number: null,
	},

	// A1 Levels (1-12)
	{ code: "a1.1", display_name: "A1.1", level_group: "a1", level_number: 1 },
	{ code: "a1.2", display_name: "A1.2", level_group: "a1", level_number: 2 },
	{ code: "a1.3", display_name: "A1.3", level_group: "a1", level_number: 3 },
	{ code: "a1.4", display_name: "A1.4", level_group: "a1", level_number: 4 },
	{ code: "a1.5", display_name: "A1.5", level_group: "a1", level_number: 5 },
	{ code: "a1.6", display_name: "A1.6", level_group: "a1", level_number: 6 },
	{ code: "a1.7", display_name: "A1.7", level_group: "a1", level_number: 7 },
	{ code: "a1.8", display_name: "A1.8", level_group: "a1", level_number: 8 },
	{ code: "a1.9", display_name: "A1.9", level_group: "a1", level_number: 9 },
	{ code: "a1.10", display_name: "A1.10", level_group: "a1", level_number: 10 },
	{ code: "a1.11", display_name: "A1.11", level_group: "a1", level_number: 11 },
	{ code: "a1.12", display_name: "A1.12", level_group: "a1", level_number: 12 },

	// A2 Levels (1-12)
	{ code: "a2.1", display_name: "A2.1", level_group: "a2", level_number: 1 },
	{ code: "a2.2", display_name: "A2.2", level_group: "a2", level_number: 2 },
	{ code: "a2.3", display_name: "A2.3", level_group: "a2", level_number: 3 },
	{ code: "a2.4", display_name: "A2.4", level_group: "a2", level_number: 4 },
	{ code: "a2.5", display_name: "A2.5", level_group: "a2", level_number: 5 },
	{ code: "a2.6", display_name: "A2.6", level_group: "a2", level_number: 6 },
	{ code: "a2.7", display_name: "A2.7", level_group: "a2", level_number: 7 },
	{ code: "a2.8", display_name: "A2.8", level_group: "a2", level_number: 8 },
	{ code: "a2.9", display_name: "A2.9", level_group: "a2", level_number: 9 },
	{ code: "a2.10", display_name: "A2.10", level_group: "a2", level_number: 10 },
	{ code: "a2.11", display_name: "A2.11", level_group: "a2", level_number: 11 },
	{ code: "a2.12", display_name: "A2.12", level_group: "a2", level_number: 12 },

	// B1 Levels (1-12)
	{ code: "b1.1", display_name: "B1.1", level_group: "b1", level_number: 1 },
	{ code: "b1.2", display_name: "B1.2", level_group: "b1", level_number: 2 },
	{ code: "b1.3", display_name: "B1.3", level_group: "b1", level_number: 3 },
	{ code: "b1.4", display_name: "B1.4", level_group: "b1", level_number: 4 },
	{ code: "b1.5", display_name: "B1.5", level_group: "b1", level_number: 5 },
	{ code: "b1.6", display_name: "B1.6", level_group: "b1", level_number: 6 },
	{ code: "b1.7", display_name: "B1.7", level_group: "b1", level_number: 7 },
	{ code: "b1.8", display_name: "B1.8", level_group: "b1", level_number: 8 },
	{ code: "b1.9", display_name: "B1.9", level_group: "b1", level_number: 9 },
	{ code: "b1.10", display_name: "B1.10", level_group: "b1", level_number: 10 },
	{ code: "b1.11", display_name: "B1.11", level_group: "b1", level_number: 11 },
	{ code: "b1.12", display_name: "B1.12", level_group: "b1", level_number: 12 },

	// B2 Levels (1-12)
	{ code: "b2.1", display_name: "B2.1", level_group: "b2", level_number: 1 },
	{ code: "b2.2", display_name: "B2.2", level_group: "b2", level_number: 2 },
	{ code: "b2.3", display_name: "B2.3", level_group: "b2", level_number: 3 },
	{ code: "b2.4", display_name: "B2.4", level_group: "b2", level_number: 4 },
	{ code: "b2.5", display_name: "B2.5", level_group: "b2", level_number: 5 },
	{ code: "b2.6", display_name: "B2.6", level_group: "b2", level_number: 6 },
	{ code: "b2.7", display_name: "B2.7", level_group: "b2", level_number: 7 },
	{ code: "b2.8", display_name: "B2.8", level_group: "b2", level_number: 8 },
	{ code: "b2.9", display_name: "B2.9", level_group: "b2", level_number: 9 },
	{ code: "b2.10", display_name: "B2.10", level_group: "b2", level_number: 10 },
	{ code: "b2.11", display_name: "B2.11", level_group: "b2", level_number: 11 },
	{ code: "b2.12", display_name: "B2.12", level_group: "b2", level_number: 12 },

	// C1 Levels (1-12)
	{ code: "c1.0", display_name: "C1", level_group: "c1", level_number: 1 },

	// C2 Levels (1-12)
	{ code: "c2.0", display_name: "C2", level_group: "c2", level_number: 1 },
];

async function populateLanguageLevels() {
	console.log("🌱 Starting to populate language_levels table...");
	console.log(`📊 Total levels to insert: ${languageLevels.length}`);

	try {
		// Insert all levels using upsert (insert or update on conflict)
		const { data, error } = await supabase
			.from("language_levels")
			.upsert(languageLevels, {
				onConflict: "code",
				ignoreDuplicates: false,
			})
			.select();

		if (error) {
			console.error("❌ Error inserting language levels:", error);
			throw error;
		}

		console.log(
			`✅ Successfully inserted/updated ${data?.length || 0} language levels`,
		);

		// Verify the total count
		const { count, error: countError } = await supabase
			.from("language_levels")
			.select("*", { count: "exact", head: true });

		if (countError) {
			console.error("❌ Error counting language levels:", countError);
		} else {
			console.log(`📊 Total language levels in database: ${count}`);
		}
	} catch (error) {
		console.error("💥 Failed to populate language levels:", error);
		process.exit(1);
	}
}

// Run the script
populateLanguageLevels()
	.then(() => {
		console.log("✨ Language levels population completed!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Script failed:", error);
		process.exit(1);
	});
