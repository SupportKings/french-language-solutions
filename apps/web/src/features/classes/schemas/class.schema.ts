import { z } from "zod";

// Enums matching database exactly
export const classStatusEnum = z.enum([
	"scheduled",
	"in_progress",
	"completed",
	"cancelled",
]);

export const classModeEnum = z.enum(["online", "in_person", "hybrid"]);

// Base class schema for forms
export const classFormSchema = z.object({
	cohort_id: z.string().uuid("Invalid cohort ID"),
	name: z.string().min(1, "Name is required").max(255),
	description: z.string().optional().nullable(),
	start_time: z.string().datetime("Invalid start time format"),
	end_time: z.string().datetime("Invalid end time format"),
	status: classStatusEnum,
	mode: classModeEnum,
	google_calendar_event_id: z.string().optional().nullable(),
	room: z.string().optional().nullable(),
	meeting_link: z
		.string()
		.url("Invalid URL")
		.optional()
		.nullable()
		.or(z.literal("")),
	google_drive_folder_id: z.string().optional().nullable(),
	materials: z.string().optional().nullable(),
	max_students: z.number().int().positive("Must be a positive number"),
	current_enrollment: z.number().int().min(0, "Cannot be negative"),
	teacher_id: z
		.string()
		.uuid("Invalid teacher ID")
		.optional()
		.nullable()
		.or(z.literal("")),
	is_active: z.boolean(),
	notes: z.string().optional().nullable(),
});

// Schema for API responses (includes all fields)
export const classSchema = classFormSchema.extend({
	id: z.string().uuid(),
	created_at: z.string().datetime(),
	updated_at: z.string().datetime(),
	deleted_at: z.string().datetime().optional().nullable(),
});

// Type exports
export type ClassFormValues = z.infer<typeof classFormSchema>;
export type Class = z.infer<typeof classSchema>;
export type ClassStatus = z.infer<typeof classStatusEnum>;
export type ClassMode = z.infer<typeof classModeEnum>;

// Filter schema for list page
export const classFiltersSchema = z.object({
	search: z.string().optional(),
	status: classStatusEnum.optional(),
	mode: classModeEnum.optional(),
	cohort_id: z.string().uuid().optional(),
	teacher_id: z.string().uuid().optional(),
	is_active: z.boolean().optional(),
	page: z.number().int().positive().default(1),
	limit: z.number().int().positive().default(20),
});

export type ClassFilters = z.infer<typeof classFiltersSchema>;
