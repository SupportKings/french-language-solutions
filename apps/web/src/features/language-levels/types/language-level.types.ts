export interface LanguageLevel {
	id: string;
	code: string;
	display_name: string;
	level_group: string;
	hours: number;
	created_at: string;
	updated_at: string;
}

export interface LanguageLevelFormData {
	code: string;
	display_name: string;
	level_group: string;
	hours: number;
}
