import { z } from "zod";

// Enums matching the database
export const groupClassBonusTermsEnum = z.enum([
	"per_student_per_hour",
	"per_hour",
]);

export const onboardingStatusEnum = z.enum([
	"new",
	"training_in_progress",
	"onboarded",
	"offboarded",
]);

export const contractTypeEnum = z.enum(["full_time", "freelancer"]);

export const teamRoleEnum = z.enum([
	"Teacher",
	"Evaluator",
	"Marketing/Admin",
	"Exec",
]);

// Teacher schema for forms
export const teacherFormSchema = z.object({
	first_name: z.string().min(1, "First name is required"),
	last_name: z.string().min(1, "Last name is required"),
	email: z.string().email("Invalid email address").optional(),
	role: z.array(teamRoleEnum).optional(),
	group_class_bonus_terms: groupClassBonusTermsEnum.optional(),
	onboarding_status: onboardingStatusEnum,
	google_calendar_id: z.string().optional(),
	maximum_hours_per_week: z.number().min(0).max(60).optional(),
	maximum_hours_per_day: z.number().min(0).max(12).optional(),
	qualified_for_under_16: z.boolean(),
	available_for_booking: z.boolean(),
	contract_type: contractTypeEnum.optional(),
	available_for_online_classes: z.boolean(),
	available_for_in_person_classes: z.boolean(),
	max_students_in_person: z.number().min(0).optional(),
	max_students_online: z.number().min(0).optional(),
	days_available_online: z
		.array(
			z.enum([
				"monday",
				"tuesday",
				"wednesday",
				"thursday",
				"friday",
				"saturday",
				"sunday",
			]),
		)
		.optional(),
	days_available_in_person: z
		.array(
			z.enum([
				"monday",
				"tuesday",
				"wednesday",
				"thursday",
				"friday",
				"saturday",
				"sunday",
			]),
		)
		.optional(),
	mobile_phone_number: z.string().optional(),
	admin_notes: z.string().optional(),
});

// Teacher response type
export const teacherResponseSchema = teacherFormSchema.extend({
	id: z.string().uuid(),
	user_id: z.string().optional(),
	email: z.string().email().optional(),
	airtable_record_id: z.string().optional(),
	role: z.array(teamRoleEnum).optional(),
	created_at: z.string(),
	updated_at: z.string(),
});

// Query parameters
export const teacherQuerySchema = z.object({
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(20),
	search: z.string().optional(),
	sortBy: z.string().default("created_at"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
	// Filters - support arrays for multi-select
	onboarding_status: z
		.union([onboardingStatusEnum, z.array(onboardingStatusEnum)])
		.optional(),
	contract_type: z
		.union([contractTypeEnum, z.array(contractTypeEnum)])
		.optional(),
	qualified_for_under_16: z.boolean().optional(),
	available_for_booking: z.boolean().optional(),
	available_for_online_classes: z.boolean().optional(),
	available_for_in_person_classes: z.boolean().optional(),
	days_available_online: z
		.array(
			z.enum([
				"monday",
				"tuesday",
				"wednesday",
				"thursday",
				"friday",
				"saturday",
				"sunday",
			]),
		)
		.optional(),
	days_available_in_person: z
		.array(
			z.enum([
				"monday",
				"tuesday",
				"wednesday",
				"thursday",
				"friday",
				"saturday",
				"sunday",
			]),
		)
		.optional(),
});

export type TeacherFormData = z.infer<typeof teacherFormSchema>;
export type Teacher = z.infer<typeof teacherResponseSchema>;
export type TeacherQuery = z.infer<typeof teacherQuerySchema>;
