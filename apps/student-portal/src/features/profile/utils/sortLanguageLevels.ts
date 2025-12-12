interface LanguageLevel {
	id: string;
	code: string;
	display_name: string;
	level_number: number | null;
	level_group?: string | null;
}

/**
 * Sorts language levels using natural sorting
 * Ensures A1.2 comes before A1.11, and proper ordering like A0, A1.1-A1.5, A2.1-A2.5, B1.1-B1.5, etc.
 */
export function sortLanguageLevels(levels: LanguageLevel[]): LanguageLevel[] {
	return [...levels].sort((a, b) => {
		// First sort by level_group (a0, a1, a2, b1, b2, c1, c2)
		if (a.level_group && b.level_group && a.level_group !== b.level_group) {
			return a.level_group.localeCompare(b.level_group);
		}

		// Then sort by code with natural sorting
		// Extract the numeric part after the dot if it exists
		const getNumericPart = (code: string) => {
			const match = code.match(/\.(\d+)$/);
			return match ? Number.parseInt(match[1], 10) : 0;
		};

		const aNum = getNumericPart(a.code);
		const bNum = getNumericPart(b.code);

		// If both have numeric parts, sort numerically
		if (aNum !== 0 || bNum !== 0) {
			return aNum - bNum;
		}

		// Otherwise, sort alphabetically
		return a.code.localeCompare(b.code);
	});
}
