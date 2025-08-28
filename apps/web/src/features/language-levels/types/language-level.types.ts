export interface LanguageLevel {
	id: string;
	code: string;
	display_name: string;
	level_group: string;
	created_at: string;
	updated_at: string;
}

export interface LanguageLevelFormData {
	code: string;
	display_name: string;
	level_group: string;
}