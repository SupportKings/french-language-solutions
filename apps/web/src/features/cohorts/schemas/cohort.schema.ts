import { z } from "zod";

// Enums matching actual database schema
export const CohortFormatEnum = z.enum(["group", "private"]);
export const CohortStatusEnum = z.enum([
	"enrollment_open",
	"enrollment_closed",
	"class_ended"
]);
export const LanguageLevelEnum = z.enum([
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
	"c2"
]);
export const RoomTypeEnum = z.enum([
	"for_one_to_one",
	"medium",
	"medium_plus", 
	"large"
]);

// Base cohort schema - using exact DB column names (snake_case)
export const CohortSchema = z.object({
	id: z.string().uuid(),
	title: z.string().nullable(), // Custom cohort title
	format: CohortFormatEnum,
	product_id: z.string().uuid().nullable(),
	google_drive_folder_id: z.string().nullable(),
	starting_level: LanguageLevelEnum.nullable(),
	start_date: z.string().nullable(), // Date string from API
	cohort_status: CohortStatusEnum,
	current_level: LanguageLevelEnum.nullable(),
	room_type: RoomTypeEnum.nullable(),
	airtable_record_id: z.string().nullable(),
	created_at: z.string(), // ISO date string
	updated_at: z.string(), // ISO date string
});

// Weekly Session schema - using exact DB column names
export const DayOfWeekEnum = z.enum([
	"monday",
	"tuesday", 
	"wednesday",
	"thursday",
	"friday",
	"saturday",
	"sunday"
]);

export const WeeklySessionSchema = z.object({
	id: z.string().uuid(),
	cohort_id: z.string().uuid(),
	teacher_id: z.string().uuid(),
	day_of_week: DayOfWeekEnum,
	start_time: z.string(), // HH:MM format
	end_time: z.string(), // HH:MM format
	google_calendar_event_id: z.string().nullable(),
	created_at: z.string(),
	updated_at: z.string(),
});

// Query schemas
export const CohortQuerySchema = z.object({
	search: z.string().optional(),
	format: CohortFormatEnum.optional(),
	cohort_status: CohortStatusEnum.optional(),
	starting_level: LanguageLevelEnum.optional(),
	current_level: LanguageLevelEnum.optional(),
	room_type: RoomTypeEnum.optional(),
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(20),
});

// Create/Update schemas
export const CreateCohortSchema = CohortSchema.omit({
	id: true,
	created_at: true,
	updated_at: true,
}).partial({
	cohort_status: true,
});

export const UpdateCohortSchema = CreateCohortSchema.partial();

// Types
export type Cohort = z.infer<typeof CohortSchema>;
export type WeeklySession = z.infer<typeof WeeklySessionSchema>;
export type CohortQuery = z.infer<typeof CohortQuerySchema>;
export type CreateCohort = z.infer<typeof CreateCohortSchema>;
export type UpdateCohort = z.infer<typeof UpdateCohortSchema>;
export type CohortFormat = z.infer<typeof CohortFormatEnum>;
export type CohortStatus = z.infer<typeof CohortStatusEnum>;
export type LanguageLevel = z.infer<typeof LanguageLevelEnum>;
export type RoomType = z.infer<typeof RoomTypeEnum>;
export type DayOfWeek = z.infer<typeof DayOfWeekEnum>;