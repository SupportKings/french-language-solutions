import { queryOptions } from "@tanstack/react-query";

export interface LanguageLevel {
	id: string;
	code: string;
	display_name: string;
	level_group: string;
	level_number: number | null;
}

async function fetchLanguageLevels(): Promise<LanguageLevel[]> {
	const response = await fetch("/api/language-levels");
	if (!response.ok) {
		throw new Error("Failed to fetch language levels");
	}
	const data = await response.json();
	return data.data || data;
}

export const languageLevelQueries = {
	all: () => ["language-levels"] as const,
	list: () =>
		queryOptions({
			queryKey: [...languageLevelQueries.all(), "list"] as const,
			queryFn: fetchLanguageLevels,
			staleTime: 1000 * 30, // 30 seconds in development for fresh data
		}),
};