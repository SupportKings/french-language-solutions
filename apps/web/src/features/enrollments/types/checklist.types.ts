// Base checklist item structure
export type ChecklistItem = {
	completed: boolean;
	completed_at: string | null; // ISO timestamp
	completed_by: string | null; // User ID
	required: boolean;
	note?: string;
};

// Enrollment Checklist
export type EnrollmentChecklistItem = ChecklistItem & {
	deprecated?: boolean;
};

export type EnrollmentChecklist = {
	class_link_sent: EnrollmentChecklistItem;
	future_class_title_correct: EnrollmentChecklistItem;
	tags_updated_in_kit: EnrollmentChecklistItem;
	contract_signed: EnrollmentChecklistItem;
	welcome_email_sent: EnrollmentChecklistItem;
	added_to_whatsapp: EnrollmentChecklistItem & { deprecated: true };
	rules_shared_in_whatsapp: EnrollmentChecklistItem & { deprecated: true };
	teacher_notified: EnrollmentChecklistItem;
	google_drive_setup: EnrollmentChecklistItem;
	payment_adjusted: EnrollmentChecklistItem;
	assessment_sent_to_teacher: EnrollmentChecklistItem;
	past_class_recordings_sent: EnrollmentChecklistItem;
};

// Transition Checklist
export type TransitionChecklistItem = ChecklistItem & {
	last_class_date?: string | null;
	old_teacher_notified?: boolean;
	new_teacher_notified?: boolean;
};

export type TransitionChecklist = {
	last_class_before_switch: TransitionChecklistItem & {
		last_class_date?: string | null;
	};
	time_slot_freed: TransitionChecklistItem;
	only_one_student_left: TransitionChecklistItem;
	whatsapp_group_updated: TransitionChecklistItem;
	class_links_updated: TransitionChecklistItem;
	new_contract_sent: TransitionChecklistItem;
	confirmation_message_sent: TransitionChecklistItem;
	follow_up_reminder_set: TransitionChecklistItem;
	future_class_title_correct: TransitionChecklistItem;
	both_teachers_notified: TransitionChecklistItem & {
		old_teacher_notified?: boolean;
		new_teacher_notified?: boolean;
	};
	transition_meeting_organized: TransitionChecklistItem;
	google_drive_transferred: TransitionChecklistItem;
	payment_modified: TransitionChecklistItem;
	fls_groups_sheet_updated: TransitionChecklistItem;
};

// Offboarding Checklist
export type OffboardingChecklistItem = ChecklistItem & {
	review_link?: string | null;
};

export type OffboardingChecklist = {
	time_slot_freed: OffboardingChecklistItem;
	reminder_adjust_final_payment: OffboardingChecklistItem;
	final_payment_adjusted: OffboardingChecklistItem;
	teacher_notified: OffboardingChecklistItem;
	class_links_title_corrected: OffboardingChecklistItem;
	removal_reminder_set: OffboardingChecklistItem;
	removed_from_system: OffboardingChecklistItem;
	review_requested: OffboardingChecklistItem;
	review_received: OffboardingChecklistItem & { review_link?: string | null };
};

// Helper function to get default enrollment checklist
export const getDefaultEnrollmentChecklist = (): EnrollmentChecklist => ({
	class_link_sent: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
	},
	future_class_title_correct: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
	},
	tags_updated_in_kit: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
		note: "Remove any tags containing 'group' and add 'FLS Team NEW'",
	},
	contract_signed: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
	},
	welcome_email_sent: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
	},
	added_to_whatsapp: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
		deprecated: true,
		note: "Can delete once chat is built",
	},
	rules_shared_in_whatsapp: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
		deprecated: true,
		note: "Can delete once chat is built",
	},
	teacher_notified: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
	},
	google_drive_setup: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
	},
	payment_adjusted: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
	},
	assessment_sent_to_teacher: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: false,
	},
	past_class_recordings_sent: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: false,
	},
});

// Helper function to get default transition checklist
export const getDefaultTransitionChecklist = (): TransitionChecklist => ({
	last_class_before_switch: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
		last_class_date: null,
	},
	time_slot_freed: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
	},
	only_one_student_left: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
		note: "Check if only 1 student left in old cohort",
	},
	whatsapp_group_updated: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
		note: "Remove from old group and add to new WhatsApp group",
	},
	class_links_updated: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
		note: "Remove from old class links and add to new",
	},
	new_contract_sent: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: false,
		note: "For private classes only",
	},
	confirmation_message_sent: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
		note: "Ask if they received everything",
	},
	follow_up_reminder_set: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
		note: "Reminder to transition and send follow-up after first class",
	},
	future_class_title_correct: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
	},
	both_teachers_notified: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
		old_teacher_notified: false,
		new_teacher_notified: false,
	},
	transition_meeting_organized: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: false,
		note: "If needed",
	},
	google_drive_transferred: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
		note: "Transfer to new teacher",
	},
	payment_modified: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: false,
		note: "If needed",
	},
	fls_groups_sheet_updated: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
	},
});

// Helper function to get default offboarding checklist
export const getDefaultOffboardingChecklist = (): OffboardingChecklist => ({
	time_slot_freed: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
	},
	reminder_adjust_final_payment: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
		note: "Reminder to adjust final payment",
	},
	final_payment_adjusted: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
	},
	teacher_notified: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
	},
	class_links_title_corrected: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
		note: "Client removed from class links title",
	},
	removal_reminder_set: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
		note: "Reminder set to remove from: WhatsApp group, group sheet, clients actifs sheet, FLS Team tag, Google Drive",
	},
	removed_from_system: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: true,
		note: "Remove from system and complete checklist",
	},
	review_requested: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: false,
	},
	review_received: {
		completed: false,
		completed_at: null,
		completed_by: null,
		required: false,
		review_link: null,
	},
});

// Helper to calculate checklist progress
export function calculateChecklistProgress(
	checklist: EnrollmentChecklist | TransitionChecklist | OffboardingChecklist,
): {
	total: number;
	completed: number;
	percentage: number;
	requiredCompleted: number;
	requiredTotal: number;
} {
	const items = Object.values(checklist);
	const requiredItems = items.filter((item) => item.required);
	const completedRequired = requiredItems.filter((item) => item.completed);
	const completedAll = items.filter((item) => item.completed);

	return {
		total: items.length,
		completed: completedAll.length,
		percentage: Math.round((completedRequired.length / requiredItems.length) * 100),
		requiredCompleted: completedRequired.length,
		requiredTotal: requiredItems.length,
	};
}

// Helper to get checklist item labels
export const ENROLLMENT_CHECKLIST_LABELS: Record<
	keyof EnrollmentChecklist,
	string
> = {
	class_link_sent: "Class link has been sent",
	future_class_title_correct: "Future class title is correct",
	tags_updated_in_kit: "Tags updated in Kit",
	contract_signed: "Contract has been signed",
	welcome_email_sent: "Welcome email has been sent",
	added_to_whatsapp: "Added to the WhatsApp group",
	rules_shared_in_whatsapp: "Rules shared in WhatsApp",
	teacher_notified: "Teacher has been notified via email",
	google_drive_setup: "Google Drive folder is set up",
	payment_adjusted: "Payment has been adjusted",
	assessment_sent_to_teacher: "Info from assessment sent to teacher (Optional)",
	past_class_recordings_sent:
		"Past class recordings sent (Optional - for students joining mid-cohort)",
};

export const TRANSITION_CHECKLIST_LABELS: Record<
	keyof TransitionChecklist,
	string
> = {
	last_class_before_switch: "Last class before switching",
	time_slot_freed: "Time slot freed",
	only_one_student_left: "Only 1 student left?",
	whatsapp_group_updated: "Remove / add to appropriate WhatsApp group",
	class_links_updated: "Remove / add to class links",
	new_contract_sent: "Send new contract if needed (for private classes only)",
	confirmation_message_sent: "Send a message asking if they received everything",
	follow_up_reminder_set:
		"Reminder to transition + send a follow-up message after their first class",
	future_class_title_correct: "Make sure the title for future classes is correct",
	both_teachers_notified: "Notify both teachers",
	transition_meeting_organized: "Organize a transition meeting if needed",
	google_drive_transferred: "Google drive + transfer to new teacher",
	payment_modified: "Modify payment if needed",
	fls_groups_sheet_updated: "Update FLS Groups sheet",
};

export const OFFBOARDING_CHECKLIST_LABELS: Record<
	keyof OffboardingChecklist,
	string
> = {
	time_slot_freed: "Time slot freed?",
	reminder_adjust_final_payment: "Reminder to adjust final payment",
	final_payment_adjusted: "Final payment adjusted",
	teacher_notified: "Teacher notified?",
	class_links_title_corrected: "Client removed from class links title correct?",
	removal_reminder_set:
		"Reminder set to remove them from WhatsApp group + group sheet + clients actifs sheet after final class + FLS Team tag + Google Drive",
	removed_from_system: "Remove from System + checklist",
	review_requested: "Asked client for review? (Optional)",
	review_received: "Did the client leave a review? (Optional)",
};
