import { z } from "zod";

// Enums matching the database
export const initialChannelEnum = z.enum([
	"form",
	"quiz",
	"call",
	"message",
	"email",
	"assessment",
]);

export const communicationChannelEnum = z.enum([
	"sms_email",
	"email",
	"sms",
]);

export const languageLevelEnum = z.enum([
	"a1",
	"a1_plus",
	"a2",
	"a2_plus",
	"b1",
	"b1_plus",
	"b2",
	"b2_plus",
	"c1",
	"c1_plus",
	"c2",
]);

// Student schema matching Supabase database exactly
export const studentSchema = z.object({
	id: z.string().uuid(),
	user_id: z.string().nullable(),
	full_name: z.string().min(1, "Full name is required"),
	first_name: z.string().nullable(), // Generated column
	last_name: z.string().nullable(), // Generated column
	email: z.string().email("Invalid email address").nullable(),
	desired_starting_language_level: languageLevelEnum.nullable(),
	mobile_phone_number: z.string().nullable(),
	city: z.string().nullable(),
	website_quiz_submission_date: z.string().nullable(), // Date as string from DB
	added_to_email_newsletter: z.boolean().nullable(),
	initial_channel: initialChannelEnum.nullable(),
	convertkit_id: z.string().nullable(),
	openphone_contact_id: z.string().nullable(),
	tally_form_submission_id: z.string().nullable(),
	respondent_id: z.string().nullable(),
	stripe_customer_id: z.string().nullable(),
	is_under_16: z.boolean().nullable(),
	communication_channel: communicationChannelEnum.nullable(),
	is_full_beginner: z.boolean().nullable(),
	subjective_deadline_for_student: z.string().nullable(), // Date as string from DB
	purpose_to_learn: z.string().nullable(),
	airtable_record_id: z.string().nullable(),
	created_at: z.string(), // Timestamp as string from DB
	updated_at: z.string(), // Timestamp as string from DB
	deleted_at: z.string().nullable(), // Timestamp as string from DB
});

// Form schemas
export const createStudentSchema = studentSchema.omit({
	id: true,
	first_name: true, // Generated
	last_name: true, // Generated
	created_at: true,
	updated_at: true,
	deleted_at: true,
	airtable_record_id: true,
	user_id: true,
	convertkit_id: true,
	openphone_contact_id: true,
	tally_form_submission_id: true,
	respondent_id: true,
	stripe_customer_id: true,
});

export const updateStudentSchema = createStudentSchema.partial();

// Query params schema
export const studentQuerySchema = z.object({
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(20),
	search: z.string().optional(),
	desired_starting_language_level: languageLevelEnum.optional(),
	initial_channel: initialChannelEnum.optional(),
	sortBy: z.enum(["created_at", "full_name", "email"]).default("created_at"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Types
export type Student = z.infer<typeof studentSchema>;
export type CreateStudent = z.infer<typeof createStudentSchema>;
export type UpdateStudent = z.infer<typeof updateStudentSchema>;
export type StudentQuery = z.infer<typeof studentQuerySchema>;