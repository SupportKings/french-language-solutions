import type { Database } from "@/utils/supabase/database.types";

export type AutomatedFollowUpStatus =
	Database["public"]["Enums"]["automated_follow_up_status"];

export interface AutomatedFollowUp {
	id: string;
	student_id: string;
	sequence_id: string;
	status: AutomatedFollowUpStatus;
	started_at: string;
	last_message_sent_at: string | null;
	completed_at: string | null;
	created_at: string;
	updated_at: string;
	student?: {
		id: string;
		full_name: string;
		email: string | null;
		mobile_phone_number: string | null;
	};
	sequence?: {
		id: string;
		display_name: string;
		subject: string;
		messages_count?: number;
	};
}

export interface CreateAutomatedFollowUpInput {
	student_id: string;
	sequence_id: string;
	started_at?: string;
	status?: AutomatedFollowUpStatus;
}

export interface UpdateAutomatedFollowUpInput {
	status?: AutomatedFollowUpStatus;
	last_message_sent_at?: string | null;
	completed_at?: string | null;
}

export interface AutomatedFollowUpWithRelations extends AutomatedFollowUp {
	student: {
		id: string;
		full_name: string;
		email: string | null;
		mobile_phone_number: string | null;
	};
	sequence: {
		id: string;
		display_name: string;
		subject: string;
	};
	touchpoints?: {
		id: string;
		message: string;
		channel: Database["public"]["Enums"]["touchpoint_channel"];
		type: Database["public"]["Enums"]["touchpoint_type"];
		source: Database["public"]["Enums"]["touchpoint_source"];
		occurred_at: string;
		created_at: string;
	}[];
}
