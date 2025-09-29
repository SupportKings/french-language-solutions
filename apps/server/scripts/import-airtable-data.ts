#!/usr/bin/env bun

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: join(process.cwd(), ".env") });

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Airtable configuration
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "";
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "";

// Validation
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
	throw new Error("Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
}

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
	throw new Error("Missing Airtable configuration. Please set AIRTABLE_API_KEY and AIRTABLE_BASE_ID");
}

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

// Track import statistics
const importStats = {
	tables: {} as Record<string, { 
		attempted: number; 
		succeeded: number; 
		failed: number;
		skipped: number;
		skippedReasons: Record<string, string[]>; // reason -> [recordIds]
	}>,
	errors: [] as Array<{ table: string; error: string; record?: any }>,
	warnings: [] as Array<{ message: string; context?: any }>,
	skippedRecords: [] as Array<{
		table: string;
		recordId: string;
		reason: string;
		details?: any;
	}>,
	summary: {
		totalRecordsFetched: 0,
		totalRecordsProcessed: 0,
		totalRecordsImported: 0,
		totalRecordsSkipped: 0,
		startTime: new Date(),
		endTime: null as Date | null,
	}
};

// Helper to track skipped records
function trackSkippedRecord(table: string, recordId: string, reason: string, details?: any) {
	// Initialize table stats if not exists
	if (!importStats.tables[table]) {
		importStats.tables[table] = { 
			attempted: 0, 
			succeeded: 0, 
			failed: 0, 
			skipped: 0,
			skippedReasons: {}
		};
	}
	
	// Add to skipped records
	importStats.skippedRecords.push({ table, recordId, reason, details });
	
	// Increment skipped count
	importStats.tables[table].skipped = (importStats.tables[table].skipped || 0) + 1;
	
	// Track skip reasons
	if (!importStats.tables[table].skippedReasons) {
		importStats.tables[table].skippedReasons = {};
	}
	if (!importStats.tables[table].skippedReasons[reason]) {
		importStats.tables[table].skippedReasons[reason] = [];
	}
	importStats.tables[table].skippedReasons[reason].push(recordId);
	
	importStats.summary.totalRecordsSkipped++;
}

// EXACT enum mappings from complete-mapping.md - NO GUESSING
const enumMappings: Record<string, Record<string, string>> = {
	onboarding_status: {
		"-1 - No Longer with FLS": "offboarded",
		"0 - New": "new",
		"10 - Training in Progress": "training_in_progress",
		"100 - Onboarded": "onboarded",
	},
	contract_type: {
		"Freelancer": "freelancer",
		"Full-Time": "full_time",
	},
	group_class_bonus_terms: {
		"Per Student Per Hour up to $50/hr": "per_student_per_hour",
		"Per Hour": "per_hour",
	},
	communication_channel: {
		"SMS & Email": "sms_email",
		"Email": "email",
		"SMS": "sms",
	},
	initial_channel: {
		"Form": "form",
		"Quiz": "quiz",
		"Call": "call",
		"Message": "message",
		"Email": "email",
		"Paid Assessment": "assessment",
	},
	enrollment_status: {
		"-2 - Declined Contract": "declined_contract",
		"-1 - Dropped Out": "dropped_out",
		"0 - Interested": "interested",
		"10 - Enrollment Form for Beginners Filled": "beginner_form_filled",
		"19 - Contract Abandoned": "contract_abandoned",
		"20 - Contract Signed": "contract_signed",
		"49 - Payment Abandoned": "payment_abandoned",
		"100 - Paid": "paid",
		"200 - Welcome Package Sent": "welcome_package_sent",
	},
	product_format: {
		"Group": "group",
		"Private": "private",
	},
	product_location: {
		"Online": "online",
		"In-Person": "in_person",
	},
	assessment_result: {
		"0 - Scheduled/Requested": "requested",
		"50 - Session Held": "session_held",
		"100 - Level Determined": "level_determined",
	},
	touchpoint_type: {
		"Inbound": "inbound",
		"Outbound": "outbound",
	},
	touchpoint_channel: {
		"SMS": "sms",
		"Call": "call",
		"WhatsApp": "whatsapp",
		"Email": "email",
	},
	automated_follow_up_status: {
		"00 - Activated": "activated",
		"50 - Follow Up Ongoing": "ongoing",
		"-2 - Answer Received": "answer_received",
		"-1 - Disabled Manually": "disabled",
		"100 - Completed": "completed",
	},
	follow_up_message_status: {
		"Active": "active",
		"Disabled": "disabled",
	},
	cohort_status: {
		"0 - Open for Enrollment": "enrollment_open",
		"50 - Closed for Enrollment": "enrollment_closed",
		"100 - Class Ended": "class_ended",
	},
	room_type: {
		"1 (1:1 Class)": "for_one_to_one",
		"5 (Medium Room)": "medium",
		"6 (Medium +)": "medium_plus",
		"10 (Large Room)": "large",
	},
	day_of_week: {
		"Monday": "monday",
		"Tuesday": "tuesday",
		"Wednesday": "wednesday",
		"Thursday": "thursday",
		"Friday": "friday",
		"Saturday": "saturday",
		"Sunday": "sunday",
	},
	team_roles: {
		"Teacher": "Teacher",
		"Evaluator": "Evaluator",
		"Marketing/Admin": "Marketing/Admin",
		"Exec": "Exec",
	},
};

// Airtable table IDs mapping (from actual schema API response)
const airtableTableIds: Record<string, string> = {
	"Teachers/Team": "tblVkXhmy8qX3FHm4",
	"Students/Leads": "tblDuD2OQoYgLA2r8",
	"Products": "tblpmFWT5CzTloQam", // Corrected from API response
	"Language Levels": "tblmTTItwW0GACuEo",
	"Follow Up Sequences - Templates": "tbl1mK5HDNXlnbVlx", // Corrected from API response
	"Follow Up Sequence - Template Messages": "tbl6qmw0Mk4i80Qf1", // Corrected from API response
	"French Programs/Cohorts": "tblQYVsRWi8jzt4jh", // Corrected from API response
	"Student Enrollments": "tblxPJbUJ2UqE7sqF",
	"Student Assessments": "tbl8qPVvfrZfqFd7d",
	"Automated Follow Ups": "tbluQwBKY1hpsOvaE",
	"CRM Touchpoints/Follow Ups": "tblYsUNtdiYXz2XPd",
	"Cohort Weekly Session": "tbl42r90BBxZsI1ak",
	"Events/Classes": "tbldeW8SeBkDIlywc",
};

// Helper: Map enum values deterministically
function mapEnum(value: string | null | undefined, enumType: string): string | null {
	if (!value) return null;
	
	const mapping = enumMappings[enumType];
	if (!mapping) {
		importStats.warnings.push({ 
			message: `No mapping defined for enum type: ${enumType}`,
			context: { value, enumType }
		});
		return null;
	}
	
	// Only use exact matches - NO GUESSING
	if (mapping[value]) {
		return mapping[value];
	}
	
	importStats.warnings.push({ 
		message: `No exact mapping for ${enumType}.${value} - skipping`,
		context: { value, enumType }
	});
	return null;
}

// Helper: Convert Yes/No to boolean
function mapYesNoToBoolean(value: string | null | undefined): boolean | null {
	if (!value) return null;
	if (value === "Yes") return true;
	if (value === "No") return false;
	return null;
}

// Helper: Convert checkbox to boolean
function mapCheckboxToBoolean(value: boolean | null | undefined): boolean | null {
	return value === true ? true : value === false ? false : null;
}

// Helper: Map multi-select field to array of enum values
function mapMultiSelectToEnumArray(values: string[] | null | undefined, enumType: string): string[] | null {
	if (!values || !Array.isArray(values) || values.length === 0) return null;
	
	const mapping = enumMappings[enumType];
	if (!mapping) {
		importStats.warnings.push({ 
			message: `No mapping defined for enum type: ${enumType}`,
			context: { values, enumType }
		});
		return null;
	}
	
	const mappedValues: string[] = [];
	for (const value of values) {
		if (mapping[value]) {
			mappedValues.push(mapping[value]);
		} else {
			importStats.warnings.push({ 
				message: `No exact mapping for ${enumType}.${value} in multi-select`,
				context: { value, enumType }
			});
		}
	}
	
	return mappedValues.length > 0 ? mappedValues : null;
}

// Helper: Convert date to ISO 8601
function convertToISO8601(date: string | null | undefined): string | null {
	if (!date) return null;
	try {
		return new Date(date).toISOString();
	} catch (e) {
		importStats.warnings.push({ 
			message: `Invalid date format: ${date}`,
			context: { date }
		});
		return null;
	}
}

// Helper: Format phone number
function formatPhoneNumber(phone: string | null | undefined): string | null {
	if (!phone) return null;
	// Keep original format for now
	return phone;
}

// Helper: Validate email
function validateEmail(email: string | null | undefined): string | null {
	if (!email) return null;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		importStats.warnings.push({ 
			message: `Invalid email format: ${email}`,
			context: { email }
		});
		return null;
	}
	return email;
}

// Helper: Fetch records from Airtable
async function fetchAirtableRecords(tableName: string): Promise<any[]> {
	const tableId = airtableTableIds[tableName];
	if (!tableId) {
		throw new Error(`No table ID found for ${tableName}`);
	}

	const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`;
	const records: any[] = [];
	let offset: string | undefined;

	do {
		const params = new URLSearchParams();
		if (offset) params.append("offset", offset);

		const response = await fetch(`${url}?${params}`, {
			headers: {
				Authorization: `Bearer ${AIRTABLE_API_KEY}`,
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch ${tableName}: ${response.statusText}`);
		}

		const data = await response.json();
		records.push(...data.records);
		offset = data.offset;
	} while (offset);

	console.log(`  ✓ Fetched ${records.length} records from ${tableName}`);
	importStats.summary.totalRecordsFetched += records.length;
	return records;
}

// Language level mapping cache
const languageLevelMapping = new Map<string, string>();

// Helper function to match Airtable record ID to Supabase language level ID
function matchAirtableLevelIdToSupabase(airtableRecordId: string): string | null {
	if (!airtableRecordId) return null;
	
	// Look up using airtable_record_id mapping
	if (languageLevelMapping.has(airtableRecordId)) {
		return languageLevelMapping.get(airtableRecordId)!;
	}
	
	console.warn(`No matching Supabase level found for Airtable record ID: ${airtableRecordId}`);
	return null;
}

// Helper function to match level name to Supabase language level ID
function matchLevelNameToSupabase(levelName: string): string | null {
	if (!levelName) return null;
	
	// First try exact match by display_name
	const exactKey = `display_name:${levelName}`;
	if (languageLevelMapping.has(exactKey)) {
		return languageLevelMapping.get(exactKey)!;
	}
	
	// For A0, map to "A0 - Complete Beginner"
	if (levelName === "A0") {
		const a0Key = `display_name:A0 - Complete Beginner`;
		if (languageLevelMapping.has(a0Key)) {
			return languageLevelMapping.get(a0Key)!;
		}
	}
	
	// Try matching by code (e.g., "A1.1" matches code "a1.1")
	const codeKey = `code:${levelName.toLowerCase()}`;
	if (languageLevelMapping.has(codeKey)) {
		return languageLevelMapping.get(codeKey)!;
	}
	
	// Try partial match - if levelName is like "B1.5", try to find display_name containing it
	for (const [key, value] of languageLevelMapping.entries()) {
		if (key.startsWith('display_name:') && key.includes(levelName)) {
			return value;
		}
	}
	
	console.warn(`No matching Supabase level found for level name: ${levelName}`);
	return null;
}

// PRE-IMPORT: Match language levels
async function matchLanguageLevels() {
	console.log("\n🔍 PRE-IMPORT: Matching language levels...");
	console.log("=" .repeat(60));
	
	// Fetch existing language levels from Supabase
	const { data: existingLevels, error } = await supabase
		.from("language_levels")
		.select("id, code, display_name, airtable_record_id");
	
	if (error) {
		console.error("Failed to fetch language levels:", error);
		return;
	}
	
	// Create mappings
	for (const level of existingLevels || []) {
		// Mapping by airtable_record_id (for ID-based matching)
		if (level.airtable_record_id) {
			languageLevelMapping.set(level.airtable_record_id, level.id);
			console.log(`  Mapped Airtable ID ${level.airtable_record_id} → ${level.display_name} (${level.id})`);
		}
		
		// Mapping by display_name (for name-based matching)
		languageLevelMapping.set(`display_name:${level.display_name}`, level.id);
		
		// Mapping by code (for code-based matching)
		languageLevelMapping.set(`code:${level.code}`, level.id);
	}
	
	console.log(`✅ Created ${languageLevelMapping.size} language level mappings`);
}

// PASS 1: Import functions for each table

async function importTeachers() {
	const tableName = "Teachers/Team";
	console.log(`\n📥 Importing ${tableName}...`);
	
	const records = await fetchAirtableRecords(tableName);
	const teachers = [];
	
	for (const record of records) {
		const fields = record.fields;
		
		const teacher = {
			first_name: fields["First Name"] || "",
			last_name: fields["Last Name"] || "",
			onboarding_status: mapEnum(fields["Team Onboarding Status"], "onboarding_status"),
			contract_type: mapEnum(fields["Contract Type"], "contract_type"),
			group_class_bonus_terms: mapEnum(fields["Group Class Bonus Terms"], "group_class_bonus_terms"),
			max_students_in_person: fields["Maximum Students Per In-Person Class"] || null,
			max_students_online: fields["Maximum Students for Online Group Class"] || null,
			available_for_online_classes: mapYesNoToBoolean(fields["Available for Teach Online Classes"]),
			available_for_in_person_classes: mapYesNoToBoolean(fields["Available for In-Person Classes"]),
			mobile_phone_number: formatPhoneNumber(fields["Mobile Phone Number"]),
			admin_notes: fields["Teacher Notes"] || null,
			role: mapMultiSelectToEnumArray(fields["Roles"], "team_roles"),
			days_available_in_person: fields["Days Available for In-Person Classes"]?.map((d: string) => mapEnum(d, "day_of_week")).filter(Boolean) || null,
			days_available_online: fields["Days Available for Online Classes"]?.map((d: string) => mapEnum(d, "day_of_week")).filter(Boolean) || null,
			available_for_booking: fields["Available for Booking?"] === "Available" ? true : false,
			qualified_for_under_16: mapYesNoToBoolean(fields["Qualified for Under 16"]),
			maximum_hours_per_day: fields["Maximum Working Hours Per Day"] || null,
			email: fields["Email"] || null,
			maximum_hours_per_week: fields["Maximum Working Hours Per Week"] || null,
			google_calendar_id: fields["Google Calendar ID"] || null,
			airtable_record_id: record.id,
		};
		
		teachers.push(teacher);
	}
	
	importStats.tables.teachers = { attempted: teachers.length, succeeded: 0, failed: 0, skipped: 0, skippedReasons: {} };
	
	if (teachers.length > 0) {
		const { data, error } = await supabase
			.from("teachers")
			.insert(teachers)
			.select();
		
		if (error) {
			importStats.tables.teachers.failed = teachers.length;
			importStats.errors.push({ table: "teachers", error: error.message });
			console.error("  ❌ Failed to import teachers:", error.message);
		} else {
			importStats.tables.teachers.succeeded = data?.length || 0;
			console.log(`  ✅ Imported ${data?.length || 0} teachers`);
		}
	}
}

async function importStudents() {
	const tableName = "Students/Leads";
	console.log(`\n📥 Importing ${tableName}...`);
	
	const records = await fetchAirtableRecords(tableName);
	const students = [];
	
	for (const record of records) {
		const fields = record.fields;
		
		// Get full name - first_name and last_name will be computed by DB
		const fullName = String(fields["Name"] || "Unknown");
		
		const student: any = {
			full_name: fullName,
			email: validateEmail(fields["Email"]),
			mobile_phone_number: formatPhoneNumber(fields["Mobile Phone Number"]),
			city: fields["City"] || null,
			communication_channel: mapEnum(fields["Default Communication Channel"], "communication_channel") || "email",
			initial_channel: mapEnum(fields["Initial Channel"], "initial_channel"),
			is_full_beginner: fields["Student's Beginning Level (from Enrollment Form)"] === "Complete Beginner (A0)" ? true : false,
			is_under_16: fields["Age Group"] === "Under 16" ? true : false,
			purpose_to_learn: fields["Why do you want to learn french?"] || null,
			subjective_deadline_for_student: fields["Student's Subjective Deadline"] || null,
			added_to_email_newsletter: fields["ConvertKit Subscriber ID"] ? true : false,
			website_quiz_submission_date: convertToISO8601(fields["Website Quiz Completed Date"]),
			desired_starting_language_level_id: null, // Will be set in Pass 2
			convertkit_id: fields["ConvertKit Subscriber ID"] || null,
			openphone_contact_id: fields["OpenPhone Contact ID"] || null,
			respondent_id: fields["Respondent ID"] || null,
			airtable_created_at: convertToISO8601(fields["Lead Created Date"]),
			stripe_customer_id: fields["Stripe Customer ID"] || null,
			tally_form_submission_id: fields["Submission ID"] || null,
			airtable_record_id: record.id,
			heard_from: fields["How did you hear about us?"] || null,
			// Store Airtable references for Pass 2
			_airtable_desired_starting_level_id: fields["Desired Starting Language Level"]?.[0] || null
		};
		
		students.push(student);
	}
	
	// Store students for Pass 2 processing
	importStats.tables.students = { attempted: students.length, succeeded: 0, failed: 0, skipped: 0, skippedReasons: {} };
	console.log(`  Found ${students.length} students for Pass 2 processing`);
	return students;
}

async function importProducts() {
	const tableName = "Products";
	console.log(`\n📥 Importing ${tableName}...`);
	
	const records = await fetchAirtableRecords(tableName);
	const products = [];
	
	for (const record of records) {
		const fields = record.fields;
		
		const product = {
			display_name: fields["Internal Nickname"] || "",
			format: mapEnum(fields["Format"], "product_format"),
			location: mapEnum(fields["Location"], "product_location"),
			pandadoc_contract_template_id: fields["Contract Template ID (PandaDoc)"] || null,
			signup_link_for_self_checkout: fields["Signup Link (for Self-Checkout)"] || null,
			airtable_record_id: record.id,
		};
		
		products.push(product);
	}
	
	importStats.tables.products = { attempted: products.length, succeeded: 0, failed: 0, skipped: 0, skippedReasons: {} };
	
	if (products.length > 0) {
		const { data, error } = await supabase
			.from("products")
			.insert(products)
			.select();
		
		if (error) {
			importStats.tables.products.failed = products.length;
			importStats.errors.push({ table: "products", error: error.message });
			console.error("  ❌ Failed to import products:", error.message);
		} else {
			importStats.tables.products.succeeded = data?.length || 0;
			console.log(`  ✅ Imported ${data?.length || 0} products`);
		}
	}
}

async function importLanguageLevels() {
	const tableName = "Language Levels";
	console.log(`\n📥 Importing ${tableName}...`);
	
	const records = await fetchAirtableRecords(tableName);
	const levels = [];
	
	for (const record of records) {
		const fields = record.fields;
		
		const level = {
			code: fields["Level Code"] || "",
			display_name: fields["Display Name"] || "",
			level_group: fields["Level Group"] || "",
			level_number: fields["Level Number"] || null,
			airtable_record_id: record.id,
		};
		
		levels.push(level);
	}
	
	importStats.tables.language_levels = { attempted: levels.length, succeeded: 0, failed: 0, skipped: 0, skippedReasons: {} };
	
	if (levels.length > 0) {
		const { data, error } = await supabase
			.from("language_levels")
			.insert(levels)
			.select();
		
		if (error) {
			importStats.tables.language_levels.failed = levels.length;
			importStats.errors.push({ table: "language_levels", error: error.message });
			console.error("  ❌ Failed to import language levels:", error.message);
		} else {
			importStats.tables.language_levels.succeeded = data?.length || 0;
			console.log(`  ✅ Imported ${data?.length || 0} language levels`);
			
			// Update language level mapping with newly imported levels
			for (const level of data || []) {
				languageLevelMapping.set(level.code, level.id);
				languageLevelMapping.set(level.display_name, level.id);
			}
		}
	}
}

async function importTemplateFollowUpSequences() {
	const tableName = "Follow Up Sequences - Templates";
	console.log(`\n📥 Importing ${tableName}...`);
	
	const records = await fetchAirtableRecords(tableName);
	const sequences = [];
	
	for (const record of records) {
		const fields = record.fields;
		
		const sequence = {
			display_name: fields["Name"] || "",
			subject: fields["Subject"] || "",
			airtable_record_id: record.id,
		};
		
		sequences.push(sequence);
	}
	
	importStats.tables.template_follow_up_sequences = { attempted: sequences.length, succeeded: 0, failed: 0, skipped: 0, skippedReasons: {} };
	
	if (sequences.length > 0) {
		const { data, error } = await supabase
			.from("template_follow_up_sequences")
			.insert(sequences)
			.select();
		
		if (error) {
			importStats.tables.template_follow_up_sequences.failed = sequences.length;
			importStats.errors.push({ table: "template_follow_up_sequences", error: error.message });
			console.error("  ❌ Failed to import sequences:", error.message);
		} else {
			importStats.tables.template_follow_up_sequences.succeeded = data?.length || 0;
			console.log(`  ✅ Imported ${data?.length || 0} sequences`);
		}
	}
}

async function importTemplateFollowUpMessages() {
	const tableName = "Follow Up Sequence - Template Messages";
	console.log(`\n📥 Importing ${tableName}...`);
	
	const records = await fetchAirtableRecords(tableName);
	const messages = [];
	
	for (const record of records) {
		const fields = record.fields;
		
		const message = {
			sequence_id: null, // Will be set in Pass 2
			step_index: fields["Step Index"] || 0,
			message_content: fields["Message"] || "",
			time_delay_hours: fields["Time Delay (Hours)"] || 0,
			status: mapEnum(fields["Status"], "follow_up_message_status"),
			airtable_record_id: record.id,
			// Store the Airtable sequence reference for Pass 2
			_airtable_sequence_id: fields["Follow Up Sequence"]?.[0] || null,
		};
		
		messages.push(message);
	}
	
	// Store messages for Pass 2 processing
	importStats.tables.template_follow_up_messages = { attempted: messages.length, succeeded: 0, failed: 0, skipped: 0, skippedReasons: {} };
	console.log(`  Found ${messages.length} messages for Pass 2 processing`);
	return messages;
}

async function importCohorts() {
	const tableName = "French Programs/Cohorts";
	console.log(`\n📥 Importing ${tableName}...`);
	
	const records = await fetchAirtableRecords(tableName);
	const cohorts = [];
	
	for (const record of records) {
		const fields = record.fields;
		
		// Handle max students field - it's a formula field in Airtable
		let maxStudents = null;
		if (fields["Max Students"]) {
			maxStudents = typeof fields["Max Students"] === 'number' 
				? fields["Max Students"] 
				: null;
		}
		
		const cohort = {
			product_id: null, // Will be set in Pass 2
			starting_level_id: null, // Will be set in Pass 2
			current_level_id: null, // Will be set in Pass 2
			cohort_status: mapEnum(fields["Cohort Status"], "cohort_status") || "class_ended",
			max_students: maxStudents,
			room_type: mapEnum(fields["Max Students - Restricted by Room (Manual)"], "room_type"),
			start_date: convertToISO8601(fields["Start Date"]),
			setup_finalized: mapCheckboxToBoolean(fields["Setup Finalized"]),
			google_drive_folder_id: fields["Google Drive Folder ID"] || null,
			airtable_record_id: record.id,
			airtable_created_at: convertToISO8601(fields["created"]),
			// Store Airtable references for Pass 2
			_airtable_product_id: fields["Product"]?.[0] || null,
			_airtable_starting_level_id: fields["Starting Level"]?.[0] || null, // This is a linked record ID
			_airtable_current_level_name: fields["Current Level"] || null, // This is a single select value
		};
		
		cohorts.push(cohort);
	}
	
	// Store cohorts for Pass 2 processing
	importStats.tables.cohorts = { attempted: cohorts.length, succeeded: 0, failed: 0, skipped: 0, skippedReasons: {} };
	console.log(`  Found ${cohorts.length} cohorts for Pass 2 processing`);
	return cohorts;
}

async function importEnrollments() {
	const tableName = "Student Enrollments";
	console.log(`\n📥 Importing ${tableName}...`);
	
	const records = await fetchAirtableRecords(tableName);
	const enrollments = [];
	
	for (const record of records) {
		const fields = record.fields;
		
		const enrollment = {
			student_id: null, // Will be set in Pass 2
			cohort_id: null, // Will be set in Pass 2
			status: mapEnum(fields["Enrollment Status"], "enrollment_status"),
			airtable_record_id: record.id,
			airtable_created_at: convertToISO8601(fields["Created"]),
			// Store Airtable references for Pass 2
			_airtable_student_id: fields["Student"]?.[0] || null,
			_airtable_cohort_id: fields["French Program/Cohort"]?.[0] || null,
		};
		
		enrollments.push(enrollment);
	}
	
	// Store enrollments for Pass 2 processing
	importStats.tables.enrollments = { 
		attempted: enrollments.length, 
		succeeded: 0, 
		failed: 0,
		skipped: 0,
		skippedReasons: {}
	};
	console.log(`  Found ${enrollments.length} enrollments for Pass 2 processing`);
	return enrollments;
}

async function importStudentAssessments() {
	const tableName = "Student Assessments";
	console.log(`\n📥 Importing ${tableName}...`);
	
	const records = await fetchAirtableRecords(tableName);
	const assessments = [];
	
	for (const record of records) {
		const fields = record.fields;
		
		const assessment = {
			student_id: null, // Will be set in Pass 2
			result: mapEnum(fields["Result"], "assessment_result"),
			level_id: null, // Will be set in Pass 2
			interview_held_by: null, // Will be set in Pass 2
			level_checked_by: null, // Will be set in Pass 2
			scheduled_for: convertToISO8601(fields["Assessment Call Scheduled For"]),
			is_paid: true,
			notes: fields["Assessment Notes"] || null,
			meeting_recording_url: fields["Meeting Recording URL"] || null,
			calendar_event_url: fields["Calendar Event URL"] || null,
			airtable_record_id: record.id,
			airtable_created_at: convertToISO8601(fields["Created"]),
			// Store Airtable references for Pass 2
			_airtable_student_id: fields["Student"]?.[0] || null,
			_airtable_level_id: fields["Assessment Level"]?.[0] || null,
			_airtable_interview_held_by: fields["Interview Held By"]?.[0] || null,
			_airtable_level_checked_by: fields["Level Checked By"]?.[0] || null
		};
		
		assessments.push(assessment);
	}
	
	// Store assessments for Pass 2 processing  
	importStats.tables.student_assessments = { attempted: assessments.length, succeeded: 0, failed: 0, skipped: 0, skippedReasons: {} };
	console.log(`  Found ${assessments.length} assessments for Pass 2 processing`);
	return assessments;
}

async function importAutomatedFollowUps() {
	const tableName = "Automated Follow Ups";
	console.log(`\n📥 Importing ${tableName}...`);
	
	const records = await fetchAirtableRecords(tableName);
	const followUps = [];
	
	for (const record of records) {
		const fields = record.fields;
		
		const followUp = {
			student_id: null, // Will be set in Pass 2
			sequence_id: null, // Will be set in Pass 2
			status: mapEnum(fields["Status"], "automated_follow_up_status"),
			started_at: convertToISO8601(fields["Activated Time"]) || new Date().toISOString(),
			last_message_sent_at: convertToISO8601(fields["Last Follow Up Time"]),
			completed_at: fields["Status"] === "100 - Completed" ? convertToISO8601(fields["Last Follow Up Time"]) : null,
			airtable_record_id: record.id,
			// Store Airtable references for Pass 2
			_airtable_student_id: fields["Student"]?.[0] || null,
			_airtable_sequence_id: fields["Follow Up Sequence"]?.[0] || null,
		};
		
		followUps.push(followUp);
	}
	
	// Store follow-ups for Pass 2 processing
	importStats.tables.automated_follow_ups = { attempted: followUps.length, succeeded: 0, failed: 0, skipped: 0, skippedReasons: {} };
	console.log(`  Found ${followUps.length} automated follow ups for Pass 2 processing`);
	return followUps;
}

async function importTouchpoints() {
	const tableName = "CRM Touchpoints/Follow Ups";
	console.log(`\n📥 Importing ${tableName}...`);
	
	const records = await fetchAirtableRecords(tableName);
	const touchpoints = [];
	
	for (const record of records) {
		const fields = record.fields;
		
		const touchpoint = {
			student_id: null, // Will be set in Pass 2
			message: fields["Message from Lead"] || fields["Message to Lead"] || "",
			channel: mapEnum(fields["Channel"], "touchpoint_channel") || "email",
			type: mapEnum(fields["Type"], "touchpoint_type") || "outbound",
			source: "manual", // Default as no source field in Airtable
			automated_follow_up_id: null, // Will be set in Pass 2
			occurred_at: convertToISO8601(fields["Date"]) || new Date().toISOString(),
			external_id: fields["External ID"] || null,
			external_metadata: fields["External Metadata"] || null,
			airtable_record_id: record.id,
			airtable_created_at: convertToISO8601(fields["Created at"]),
			// Store Airtable references for Pass 2
			_airtable_student_id: fields["Leads"]?.[0] || null, // Using "Leads" field, not "Student"
			_airtable_automated_follow_up_id: fields["Automated Follow Up"]?.[0] || null,
		};
		
		touchpoints.push(touchpoint);
	}
	
	// Store touchpoints for Pass 2 processing
	importStats.tables.touchpoints = { attempted: touchpoints.length, succeeded: 0, failed: 0, skipped: 0, skippedReasons: {} };
	console.log(`  Found ${touchpoints.length} touchpoints for Pass 2 processing`);
	return touchpoints;
}

async function importWeeklySessions() {
	const tableName = "Cohort Weekly Session";
	console.log(`\n📥 Importing ${tableName}...`);
	
	const records = await fetchAirtableRecords(tableName);
	const sessions = [];
	
	for (const record of records) {
		const fields = record.fields;
		
		// Get day of week from the formula field "Day of Week (String)"
		// This field contains values like "Monday", "Tuesday", "Saturday", etc.
		const dayOfWeekString = fields["Day of Week (String)"];
		if (!dayOfWeekString) {
			trackSkippedRecord("weekly_sessions", record.id, "Day of Week (String) field is missing", {
				availableFields: Object.keys(fields)
			});
			continue;
		}
		
		const dayOfWeek = mapEnum(dayOfWeekString, "day_of_week");
		if (!dayOfWeek) {
			trackSkippedRecord("weekly_sessions", record.id, "Could not map Day of Week value", {
				dayOfWeekString: dayOfWeekString
			});
			continue;
		}
		
		// Handle time fields - Start Time is duration (seconds), End Time is formula
		const startTimeDuration = fields["Start Time (hh:mm)"]; // This is duration in seconds
		let endTime = fields["End Time"]; // This is a formula string
		
		// Convert duration (seconds) to HH:MM:SS format
		let startTime: string;
		if (typeof startTimeDuration === 'number') {
			const hours = Math.floor(startTimeDuration / 3600);
			const minutes = Math.floor((startTimeDuration % 3600) / 60);
			const seconds = startTimeDuration % 60;
			startTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
		} else {
			trackSkippedRecord("weekly_sessions", record.id, "Start time is not a duration number", {
				startTimeType: typeof startTimeDuration,
				startTimeValue: startTimeDuration
			});
			continue;
		}
		
		// Handle End Time formula field
		if (!endTime || typeof endTime !== 'string') {
			trackSkippedRecord("weekly_sessions", record.id, "End time is not valid", {
				endTimeType: typeof endTime,
				endTimeValue: endTime
			});
			continue;
		}
		
		// End Time from formula might be in format like "3:30 PM" or "15:30"
		// Try to parse and convert to HH:MM:SS
		if (endTime.includes('AM') || endTime.includes('PM')) {
			// Parse 12-hour format
			const match = endTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
			if (match) {
				let hours = parseInt(match[1]);
				const minutes = match[2];
				const ampm = match[3].toUpperCase();
				
				if (ampm === 'PM' && hours !== 12) hours += 12;
				if (ampm === 'AM' && hours === 12) hours = 0;
				
				endTime = `${String(hours).padStart(2, '0')}:${minutes}:00`;
			} else {
				trackSkippedRecord("weekly_sessions", record.id, "Could not parse end time format", {
					endTime: endTime
				});
				continue;
			}
		} else if (endTime.match(/^\d{1,2}:\d{2}$/)) {
			// Already in HH:MM format, just add seconds
			endTime = endTime + ':00';
		} else if (!endTime.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
			trackSkippedRecord("weekly_sessions", record.id, "Invalid end time format", {
				endTime: endTime
			});
			continue;
		}
		
		const session = {
			cohort_id: null, // Will be set in Pass 2
			teacher_id: null, // Will be set in Pass 2
			day_of_week: dayOfWeek, // Required field, already validated above
			start_time: startTime,
			end_time: endTime,
			google_calendar_event_id: fields["Google Calendar Event ID"] || null,
			airtable_record_id: record.id,
			airtable_created_at: convertToISO8601(fields["Created at"]),
			// Store Airtable references for Pass 2
			_airtable_cohort_id: fields["Cohort"]?.[0] || null,
			_airtable_teacher_id: fields["Teacher"]?.[0] || null,
		};
		
		sessions.push(session);
	}
	
	// Store sessions for Pass 2 processing
	importStats.tables.weekly_sessions = { attempted: sessions.length, succeeded: 0, failed: 0, skipped: 0, skippedReasons: {} };
	console.log(`  Found ${sessions.length} weekly sessions for Pass 2 processing`);
	return sessions;
}

async function importClasses() {
	const tableName = "Events/Classes";
	console.log(`\n📥 Importing ${tableName}...`);
	
	const records = await fetchAirtableRecords(tableName);
	const classes = [];
	
	for (const record of records) {
		const fields = record.fields;
		
		const classItem = {
			cohort_id: null, // Will be set in Pass 2
			teacher_id: null, // Will be set in Pass 2
			start_time: convertToISO8601(fields["Start Date Time"]) || new Date().toISOString(),
			end_time: convertToISO8601(fields["End Date"]) || new Date().toISOString(),
			status: "scheduled", // Default as no status field in Airtable
			meeting_link: fields["Online Access Link"] || null,
			notes: fields["Notes"] || null,
			google_calendar_event_id: fields["Google Calendar Event ID"] || null,
			google_drive_folder_id: fields["Google Drive Folder ID"] || null,
			airtable_record_id: record.id,
			// Store Airtable references for Pass 2
			_airtable_cohort_id: fields["French Program/Cohort"]?.[0] || null,
			_airtable_teacher_id: fields["Teacher"]?.[0] || null,
		};
		
		classes.push(classItem);
	}
	
	// Store classes for Pass 2 processing
	importStats.tables.classes = { attempted: classes.length, succeeded: 0, failed: 0, skipped: 0, skippedReasons: {} };
	console.log(`  Found ${classes.length} classes for Pass 2 processing`);
	return classes;
}

// PASS 2: Update foreign key relationships
async function updateForeignKeys(
	students: any[],
	templateMessages: any[],
	cohorts: any[],
	enrollments: any[],
	assessments: any[],
	automatedFollowUps: any[],
	touchpoints: any[],
	weeklySessions: any[],
	classes: any[]
) {
	console.log("\n🔗 PASS 2: Resolving foreign key relationships...");
	console.log("=" .repeat(60));
	
	// Build lookup maps for all tables
	const lookupMaps: Record<string, Map<string, string>> = {};
	
	const tables = [
		"teachers",
		"students", 
		"products",
		"template_follow_up_sequences",
		"cohorts",
		"enrollments",
		"student_assessments",
		"automated_follow_ups",
	];
	
	for (const tableName of tables) {
		const map = new Map<string, string>();
		let offset = 0;
		const limit = 1000;
		let hasMore = true;
		
		// Fetch ALL records with pagination
		while (hasMore) {
			const { data, error } = await supabase
				.from(tableName)
				.select("id, airtable_record_id")
				.range(offset, offset + limit - 1);
			
			if (error) {
				console.error(`  ❌ Failed to fetch ${tableName} for lookup:`, error.message);
				hasMore = false;
				break;
			}
			
			if (!data || data.length === 0) {
				hasMore = false;
			} else {
				for (const record of data) {
					if (record.airtable_record_id) {
						map.set(record.airtable_record_id, record.id);
					}
				}
				
				if (data.length < limit) {
					hasMore = false;
				} else {
					offset += limit;
				}
			}
		}
		
		lookupMaps[tableName] = map;
		console.log(`  ✓ Built lookup map for ${tableName}: ${map.size} records`);
		if(tableName === "cohorts") {
			console.log("cohorts map", map);
		}
	}
	
	// Update students with level IDs
	if (students.length > 0) {
		console.log("\n  Updating students...");
		const studentsToInsert = [];
		
		for (const student of students) {
			// Resolve desired starting level ID
			if (student._airtable_desired_starting_level_id) {
				student.desired_starting_language_level_id = matchAirtableLevelIdToSupabase(student._airtable_desired_starting_level_id);
			}
			
			// Clean up temporary fields
			delete student._airtable_desired_starting_level_id;
			studentsToInsert.push(student);
		}
		
		// Insert all students at once
		if (studentsToInsert.length > 0) {
			console.log(`    Inserting ${studentsToInsert.length} students...`);
			
			const { data, error } = await supabase
				.from("students")
				.insert(studentsToInsert)
				.select();
			
			if (error) {
				console.error(`    ❌ Failed to insert students:`, error.message);
				importStats.errors.push({ table: "students", error: error.message });
				importStats.tables.students = { 
					attempted: studentsToInsert.length, 
					succeeded: 0, 
					failed: studentsToInsert.length,
					skipped: 0,
					skippedReasons: {}
				};
			} else {
				const totalSucceeded = data?.length || 0;
				console.log(`    ✅ Inserted ${totalSucceeded} students`);
				importStats.tables.students = { 
					attempted: studentsToInsert.length, 
					succeeded: totalSucceeded, 
					failed: studentsToInsert.length - totalSucceeded,
					skipped: 0,
					skippedReasons: {}
				};
			}
			
		}
		
		// ALWAYS rebuild lookup map for students after any insertions
		// Fetch ALL students with pagination (Supabase default limit is 1000)
		const map = new Map<string, string>();
		let offset = 0;
		const limit = 1000;
		let hasMore = true;
		
		while (hasMore) {
			const { data: studentData, error } = await supabase
				.from("students")
				.select("id, airtable_record_id")
				.range(offset, offset + limit - 1);
			
			if (error) {
				console.error("    ❌ Failed to fetch students for lookup:", error.message);
				break;
			}
			
			if (!studentData || studentData.length === 0) {
				hasMore = false;
			} else {
				for (const record of studentData) {
					if (record.airtable_record_id) {
						map.set(record.airtable_record_id, record.id);
					}
				}
				
				if (studentData.length < limit) {
					hasMore = false;
				} else {
					offset += limit;
				}
			}
		}
		
		lookupMaps.students = map;
		console.log(`    ✓ Rebuilt students lookup map: ${map.size} records`);
	}
	
	// Update template messages with sequence IDs
	if (templateMessages.length > 0) {
		console.log("\n  Updating template messages...");
		const messagesToInsert = [];
		
		for (const message of templateMessages) {
			if (message._airtable_sequence_id) {
				const sequenceId = lookupMaps.template_follow_up_sequences?.get(message._airtable_sequence_id);
				if (sequenceId) {
					delete message._airtable_sequence_id;
					message.sequence_id = sequenceId;
					messagesToInsert.push(message);
				} else {
				}
			} else {
				console.warn(`    ⚠️ Message ${message.airtable_record_id} has no sequence reference`);
			}
		}
		
		console.log(`    Found ${messagesToInsert.length}/${templateMessages.length} messages with valid sequence references`);
		
		if (messagesToInsert.length > 0) {
			const { error } = await supabase
				.from("template_follow_up_messages")
				.insert(messagesToInsert);
			
			if (error) {
				console.error("    ❌ Failed to insert template messages:", error.message);
				importStats.errors.push({ table: "template_follow_up_messages", error: error.message });
			} else {
				console.log(`    ✅ Inserted ${messagesToInsert.length} template messages`);
				importStats.tables.template_follow_up_messages = { 
					attempted: messagesToInsert.length, 
					succeeded: messagesToInsert.length, 
					failed: 0,
					skipped: 0,
					skippedReasons: {}
				};
			}
		}
	}
	
	// Update cohorts with product and level IDs
	if (cohorts.length > 0) {
		console.log("\n  Updating cohorts...");
		const cohortsToInsert = [];
		
		for (const cohort of cohorts) {
			// Resolve product ID
			if (cohort._airtable_product_id) {
				cohort.product_id = lookupMaps.products?.get(cohort._airtable_product_id) || null;
			}
			
			// Resolve level IDs using different strategies
			if (cohort._airtable_starting_level_id) {
				// Starting Level: Use Airtable record ID to match with airtable_record_id in Supabase
				cohort.starting_level_id = matchAirtableLevelIdToSupabase(cohort._airtable_starting_level_id);
			}
			if (cohort._airtable_current_level_name) {
				// Current Level: Use display name to match with display_name in Supabase
				cohort.current_level_id = matchLevelNameToSupabase(cohort._airtable_current_level_name);
			}
			
			// Clean up temporary fields
			delete cohort._airtable_product_id;
			delete cohort._airtable_starting_level_id;
			delete cohort._airtable_current_level_name;
			
			cohortsToInsert.push(cohort);
		}
		
		if (cohortsToInsert.length > 0) {
			console.log(`    Attempting to insert ${cohortsToInsert.length} cohorts...`);
			const { data: insertedCohorts, error } = await supabase
				.from("cohorts")
				.insert(cohortsToInsert)
				.select();
			
			if (error) {
				console.error("    ❌ Failed to insert cohorts:", error.message);
				console.error("    Error details:", error);
				importStats.errors.push({ table: "cohorts", error: error.message });
				importStats.tables.cohorts = { 
					attempted: cohortsToInsert.length, 
					succeeded: 0, 
					failed: cohortsToInsert.length,
					skipped: 0,
					skippedReasons: {}
				};
			} else {
				const actualInserted = insertedCohorts?.length || 0;
				console.log(`    ✅ Actually inserted ${actualInserted}/${cohortsToInsert.length} cohorts`);
				importStats.tables.cohorts = { 
					attempted: cohortsToInsert.length, 
					succeeded: actualInserted, 
					failed: cohortsToInsert.length - actualInserted,
					skipped: 0,
					skippedReasons: {}
				};
			}
		}
		
		// ALWAYS rebuild lookup map for cohorts after any insertions
		// Fetch ALL cohorts with pagination
		const cohortMap = new Map<string, string>();
		let cohortOffset = 0;
		const cohortLimit = 1000;
		let hasMoreCohorts = true;
		
		while (hasMoreCohorts) {
			const { data: cohortData, error } = await supabase
				.from("cohorts")
				.select("id, airtable_record_id")
				.range(cohortOffset, cohortOffset + cohortLimit - 1);
			
			if (error) {
				console.error("    ❌ Failed to fetch cohorts for lookup:", error.message);
				break;
			}
			
			if (!cohortData || cohortData.length === 0) {
				hasMoreCohorts = false;
			} else {
				for (const record of cohortData) {
					if (record.airtable_record_id) {
						cohortMap.set(record.airtable_record_id, record.id);
					}
				}
				
				if (cohortData.length < cohortLimit) {
					hasMoreCohorts = false;
				} else {
					cohortOffset += cohortLimit;
				}
			}
		}
		
		lookupMaps.cohorts = cohortMap;
		console.log(`    ✓ Rebuilt cohorts lookup map: ${cohortMap.size} records`);
	}
	
	// Update enrollments
	if (enrollments.length > 0) {
		console.log("\n  Updating enrollments...");
		const enrollmentsToInsert = [];
		
		for (const enrollment of enrollments) {
			let skipReason = null;
			
			if (enrollment._airtable_student_id) {
				enrollment.student_id = lookupMaps.students?.get(enrollment._airtable_student_id);
				if (!enrollment.student_id) {
					skipReason = "Student not found" + lookupMaps.students?.get(enrollment._airtable_student_id) + " " + enrollment._airtable_student_id;
				}
			} else {
				skipReason = "No student reference";
			}
			
			if (enrollment._airtable_cohort_id) {
				enrollment.cohort_id = lookupMaps.cohorts?.get(enrollment._airtable_cohort_id);
				if (!enrollment.cohort_id) {
					skipReason = skipReason ? "Student and Cohort not found" : "Cohort not found";
				}
			} else {
				skipReason = skipReason ? "No student or cohort reference" : "No cohort reference";
			}
			
			// Only insert if we have both required foreign keys
			if (enrollment.student_id && enrollment.cohort_id) {
				delete enrollment._airtable_student_id;
				delete enrollment._airtable_cohort_id;
				enrollmentsToInsert.push(enrollment);
			} else {
				trackSkippedRecord("enrollments", enrollment.airtable_record_id, skipReason || "Missing required references", {
					student_ref: enrollment._airtable_student_id,
					cohort_ref: enrollment._airtable_cohort_id,
					has_student_id: !!enrollment.student_id,
					has_cohort_id: !!enrollment.cohort_id
				});
			}
		}
		
		if (enrollmentsToInsert.length > 0) {
			const { error } = await supabase
				.from("enrollments")
				.insert(enrollmentsToInsert);
			
			if (error) {
				console.error("    ❌ Failed to insert enrollments:", error.message);
				importStats.errors.push({ table: "enrollments", error: error.message });
			} else {
				console.log(`    ✅ Inserted ${enrollmentsToInsert.length} enrollments`);
				importStats.tables.enrollments.succeeded = enrollmentsToInsert.length;
			}
		}
	}
	
	// Update assessments
	if (assessments.length > 0) {
		console.log("\n  Updating student assessments...");
		const assessmentsToInsert = [];
		
		for (const assessment of assessments) {
			if (assessment._airtable_student_id) {
				assessment.student_id = lookupMaps.students?.get(assessment._airtable_student_id);
			}
			if (assessment._airtable_level_id) {
				// Level: Use Airtable record ID to match with airtable_record_id in Supabase
				assessment.level_id = matchAirtableLevelIdToSupabase(assessment._airtable_level_id);
			}
			if (assessment._airtable_interview_held_by) {
				assessment.interview_held_by = lookupMaps.teachers?.get(assessment._airtable_interview_held_by) || null;
			}
			if (assessment._airtable_level_checked_by) {
				assessment.level_checked_by = lookupMaps.teachers?.get(assessment._airtable_level_checked_by) || null;
			}
			
			// Only insert if we have required student_id
			if (assessment.student_id) {
				delete assessment._airtable_student_id;
				delete assessment._airtable_level_id;
				delete assessment._airtable_interview_held_by;
				delete assessment._airtable_level_checked_by;
				assessmentsToInsert.push(assessment);
			}
		}
		
		if (assessmentsToInsert.length > 0) {
			const { error } = await supabase
				.from("student_assessments")
				.insert(assessmentsToInsert);
			
			if (error) {
				console.error("    ❌ Failed to insert assessments:", error.message);
				importStats.errors.push({ table: "student_assessments", error: error.message });
			} else {
				console.log(`    ✅ Inserted ${assessmentsToInsert.length} assessments`);
				importStats.tables.student_assessments = { attempted: assessmentsToInsert.length, succeeded: assessmentsToInsert.length, failed: 0, skipped: 0, skippedReasons: {} };
			}
		}
	}
	
	// Update automated follow ups
	if (automatedFollowUps.length > 0) {
		console.log("\n  Updating automated follow ups...");
		const followUpsToInsert = [];
		
		for (const followUp of automatedFollowUps) {
			if (followUp._airtable_student_id) {
				followUp.student_id = lookupMaps.students?.get(followUp._airtable_student_id);
			}
			if (followUp._airtable_sequence_id) {
				followUp.sequence_id = lookupMaps.template_follow_up_sequences?.get(followUp._airtable_sequence_id);
			}
			
			// Only insert if we have required student_id and sequence_id
			if (followUp.student_id && followUp.sequence_id) {
				delete followUp._airtable_student_id;
				delete followUp._airtable_sequence_id;
				followUpsToInsert.push(followUp);
			}
		}
		
		if (followUpsToInsert.length > 0) {
			const { error } = await supabase
				.from("automated_follow_ups")
				.insert(followUpsToInsert);
			
			if (error) {
				console.error("    ❌ Failed to insert automated follow ups:", error.message);
				importStats.errors.push({ table: "automated_follow_ups", error: error.message });
			} else {
				console.log(`    ✅ Inserted ${followUpsToInsert.length} automated follow ups`);
				importStats.tables.automated_follow_ups = { attempted: followUpsToInsert.length, succeeded: followUpsToInsert.length, failed: 0, skipped: 0, skippedReasons: {} };
				
				// Rebuild lookup map for automated_follow_ups
				const { data } = await supabase
					.from("automated_follow_ups")
					.select("id, airtable_record_id");
				
				const map = new Map<string, string>();
				for (const record of data || []) {
					if (record.airtable_record_id) {
						map.set(record.airtable_record_id, record.id);
					}
				}
				lookupMaps.automated_follow_ups = map;
			}
		}
	}
	
	// Update touchpoints
	if (touchpoints.length > 0) {
		console.log("\n  Updating touchpoints...");
		const touchpointsToInsert = [];
		
		for (const touchpoint of touchpoints) {
			if (touchpoint._airtable_student_id) {
				touchpoint.student_id = lookupMaps.students?.get(touchpoint._airtable_student_id);
				if (!touchpoint.student_id) {
					// Debug: Check if the map exists and has entries
					if (!lookupMaps.students) {
					} else if (lookupMaps.students.size === 0) {
					}
				}
			}
			if (touchpoint._airtable_automated_follow_up_id) {
				touchpoint.automated_follow_up_id = lookupMaps.automated_follow_ups?.get(touchpoint._airtable_automated_follow_up_id) || null;
			}
			
			// Only insert if we have required student_id
			if (touchpoint.student_id) {
				delete touchpoint._airtable_student_id;
				delete touchpoint._airtable_automated_follow_up_id;
				touchpointsToInsert.push(touchpoint);
			} else {
			}
		}
		
		console.log(`    Found ${touchpointsToInsert.length}/${touchpoints.length} touchpoints with valid student references`);
		
		if (touchpointsToInsert.length > 0) {
			const { error } = await supabase
				.from("touchpoints")
				.insert(touchpointsToInsert);
			
			if (error) {
				console.error("    ❌ Failed to insert touchpoints:", error.message);
				importStats.errors.push({ table: "touchpoints", error: error.message });
			} else {
				console.log(`    ✅ Inserted ${touchpointsToInsert.length} touchpoints`);
				importStats.tables.touchpoints = { attempted: touchpointsToInsert.length, succeeded: touchpointsToInsert.length, failed: 0, skipped: 0, skippedReasons: {} };
			}
		}
	}
	
	// Update weekly sessions
	if (weeklySessions.length > 0) {
		console.log("\n  Updating weekly sessions...");
		console.log(`    Cohorts lookup map has ${lookupMaps.cohorts?.size || 0} entries`);
		const sessionsToInsert = [];
		
		for (const session of weeklySessions) {
			if (session._airtable_cohort_id) {
				session.cohort_id = lookupMaps.cohorts?.get(session._airtable_cohort_id);
				if (!session.cohort_id) {
					// Check if this cohort exists in the imported cohorts array
					const cohortExists = cohorts.find(c => c.airtable_record_id === session._airtable_cohort_id);
					if (cohortExists) {					}
				}
			}
			if (session._airtable_teacher_id) {
				session.teacher_id = lookupMaps.teachers?.get(session._airtable_teacher_id);
				if (!session.teacher_id) {
				}
			}
			
			// Only insert if we have required cohort_id
			if (session.cohort_id) {
				delete session._airtable_cohort_id;
				delete session._airtable_teacher_id;
				sessionsToInsert.push(session);
			} else {
				trackSkippedRecord("weekly_sessions", session.airtable_record_id, "No cohort_id found", {
					airtable_cohort_id: session._airtable_cohort_id
				});
			}
		}
		
		if (sessionsToInsert.length > 0) {
			const { error } = await supabase
				.from("weekly_sessions")
				.insert(sessionsToInsert);
			
			if (error) {
				console.error("    ❌ Failed to insert weekly sessions:", error.message);
				importStats.errors.push({ table: "weekly_sessions", error: error.message });
			} else {
				console.log(`    ✅ Inserted ${sessionsToInsert.length} weekly sessions`);
				importStats.tables.weekly_sessions = { attempted: sessionsToInsert.length, succeeded: sessionsToInsert.length, failed: 0, skipped: 0, skippedReasons: {} };
			}
		}
	}
	
	// Update classes
	if (classes.length > 0) {
		console.log("\n  Updating classes...");
		const classesToInsert = [];
		
		for (const classItem of classes) {
			if (classItem._airtable_cohort_id) {
				classItem.cohort_id = lookupMaps.cohorts?.get(classItem._airtable_cohort_id);
			}
			if (classItem._airtable_teacher_id) {
				classItem.teacher_id = lookupMaps.teachers?.get(classItem._airtable_teacher_id) || null;
			}

			if (!classItem.cohort_id) {
				trackSkippedRecord("classes", classItem.airtable_record_id, "No cohort_id found", {
					airtable_cohort_id: classItem._airtable_cohort_id
				});
			}
			if (!classItem.teacher_id) {
				trackSkippedRecord("classes", classItem.airtable_record_id, "No teacher_id found", {
					airtable_teacher_id: classItem._airtable_teacher_id
				});
			}
			
			// Only insert if we have required cohort_id
			if (classItem.cohort_id) {
				delete classItem._airtable_cohort_id;
				delete classItem._airtable_teacher_id;
				classesToInsert.push(classItem);
			}
		}
		
		if (classesToInsert.length > 0) {
			const { error } = await supabase
				.from("classes")
				.insert(classesToInsert);
			
			if (error) {
				console.error("    ❌ Failed to insert classes:", error.message);
				importStats.errors.push({ table: "classes", error: error.message });
			} else {
				console.log(`    ✅ Inserted ${classesToInsert.length} classes`);
				importStats.tables.classes = { attempted: classesToInsert.length, succeeded: classesToInsert.length, failed: 0, skipped: 0, skippedReasons: {} };
			}
		}
	}
	
	console.log("\n✅ Foreign key relationships resolved");
}


// Function to clean existing data
async function cleanExistingData() {
	console.log("\n🗑️  CLEANING EXISTING DATA...");
	console.log("=" .repeat(60));
	
	// Define tables in reverse dependency order (most dependent first)
	const tablesToClean = [
		"classes",
		"weekly_sessions",
		"touchpoints",
		"automated_follow_ups",
		"student_assessments",
		"enrollments",
		"template_follow_up_messages",
		"cohorts",
		"template_follow_up_sequences",
		"products",
		"students",
		"teachers",
		// Skip language_levels - we use existing ones
	];
	
	for (const table of tablesToClean) {
		try {
			// Delete all records from the table
			const { error } = await supabase
				.from(table)
				.delete()
				.neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (workaround for no WHERE clause)
			
			if (error) {
				console.log(`  ⚠️  Could not clean ${table}: ${error.message}`);
			} else {
				console.log(`  ✓ Cleaned ${table}`);
			}
		} catch (e) {
			console.log(`  ⚠️  Error cleaning ${table}:`, e);
		}
	}
	
	console.log("\n✅ Data cleaning completed");
}

// Main import function
async function main() {
	console.log("🚀 Starting Airtable to Supabase data import");
	console.log("=" .repeat(60));
	
	// Check if user wants to clean existing data
	const args = process.argv.slice(2);
	const shouldClean = args.includes('--clean') || args.includes('-c');
	const forceClean = args.includes('--force-clean') || args.includes('-f');
	
	if (forceClean) {
		await cleanExistingData();
	} else if (shouldClean) {
		console.log("\n⚠️  WARNING: This will DELETE all existing data in the target tables!");
		console.log("Press Ctrl+C to cancel, or wait 5 seconds to continue...");
		await new Promise(resolve => setTimeout(resolve, 5000));
		await cleanExistingData();
	} else {
		console.log("\n💡 Tip: Use --clean flag to remove existing data before import");
		console.log("   Example: bun run scripts/import-airtable-data.ts --clean");
	}
	
	
	console.log("\nUsing THREE-PASS strategy:");
	console.log("  1. Pre-Import: Match language levels");
	console.log("  2. Pass 1: Import all data with airtable_record_id");
	console.log("  3. Pass 2: Resolve foreign key relationships");
	console.log("=" .repeat(60));
	
	try {
		// PRE-IMPORT: Match language levels
		await matchLanguageLevels();
		
		// PASS 1: Import all data
		console.log("\n📦 PASS 1: Importing all records");
		console.log("=" .repeat(60));
		
		// Import reference data first
		await importProducts();
		// Skip importLanguageLevels() - we use existing ones with matching
		await importTeachers();
		
		// Import dependent data (storing for Pass 2)
		const students = await importStudents();
		await importTemplateFollowUpSequences();
		const templateMessages = await importTemplateFollowUpMessages();
		const cohorts = await importCohorts();
		const enrollments = await importEnrollments();
		const assessments = await importStudentAssessments();
		const automatedFollowUps = await importAutomatedFollowUps();
		const touchpoints = await importTouchpoints();
		const weeklySessions = await importWeeklySessions();
		const classes = await importClasses();
		
		// PASS 2: Update foreign keys
		await updateForeignKeys(
			students,
			templateMessages,
			cohorts,
			enrollments,
			assessments,
			automatedFollowUps,
			touchpoints,
			weeklySessions,
			classes
		);
		
		console.log("\n✅ IMPORT COMPLETED");
		console.log("=" .repeat(60));
		
	} catch (error) {
		console.error("\n❌ IMPORT FAILED:", error);
		process.exit(1);
	}
}

// Run the import
if (import.meta.main) {
	main();
}