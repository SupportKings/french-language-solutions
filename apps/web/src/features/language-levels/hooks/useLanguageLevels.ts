import { useQuery } from "@tanstack/react-query";
import { languageLevelQueries } from "../queries/language-levels.queries";

export function useLanguageLevels() {
	const { data: levels = [], isLoading } = useQuery(
		languageLevelQueries.list(),
	);

	// Transform to options format for selects and filters
	const options = levels.map((level) => ({
		label: level.display_name,
		value: level.id,
	}));

	// Create a mapping for old enum values to new IDs (for migration purposes)
	const enumToIdMap = levels.reduce(
		(acc, level) => {
			// Map old enum values to new level codes
			const enumMappings: Record<string, string> = {
				a1: "a1.1",
				a1_plus: "a1.6",
				a2: "a2.1",
				a2_plus: "a2.6",
				b1: "b1.1",
				b1_plus: "b1.6",
				b2: "b2.1",
				b2_plus: "b2.6",
				c1: "c1.1",
				c1_plus: "c1.6",
				c2: "c2.1",
			};

			// Check if this level code matches any enum mapping
			Object.entries(enumMappings).forEach(([enumValue, code]) => {
				if (level.code === code) {
					acc[enumValue] = level.id;
				}
			});

			return acc;
		},
		{} as Record<string, string>,
	);

	// Helper to get level by ID
	const getLevelById = (id: string) => levels.find((level) => level.id === id);

	// Helper to get level by code
	const getLevelByCode = (code: string) =>
		levels.find((level) => level.code === code);

	return {
		levels,
		options,
		isLoading,
		enumToIdMap,
		getLevelById,
		getLevelByCode,
	};
}
