import type { LanguageLevel } from "../types/language-level.types";

/**
 * Sorts language levels using natural sorting
 * Ensures A1.2 comes before A1.11
 */
export function sortLanguageLevels(levels: LanguageLevel[]): LanguageLevel[] {
	return [...levels].sort((a, b) => {
		// First sort by level_group (a0, a1, a2, b1, b2, c1, c2)
		if (a.level_group !== b.level_group) {
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

/**
 * Compare function for sorting language level codes
 */
export function compareLanguageLevelCodes(a: string, b: string): number {
	// Extract level group (a0, a1, etc)
	const aGroup = a.match(/^[a-c]\d/)?.[0] || a;
	const bGroup = b.match(/^[a-c]\d/)?.[0] || b;

	if (aGroup !== bGroup) {
		return aGroup.localeCompare(bGroup);
	}

	// Extract numeric part after dot
	const aNum = Number.parseInt(a.split(".")[1] || "0", 10);
	const bNum = Number.parseInt(b.split(".")[1] || "0", 10);

	return aNum - bNum;
}