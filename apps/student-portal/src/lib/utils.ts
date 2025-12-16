import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function cx(...args: ClassValue[]) {
	return twMerge(clsx(...args));
}

export const focusInput = [
	"focus:ring-2",
	"focus:ring-blue-200 dark:focus:ring-blue-700/30",
	"focus:border-blue-500 dark:focus:border-blue-700",
];

export const focusRing = [
	"outline outline-offset-2 outline-0 focus-visible:outline-2",
	"outline-blue-500 dark:outline-blue-500",
];

export const hasErrorInput = [
	"ring-2",
	"border-red-500 dark:border-red-700",
	"ring-red-200 dark:ring-red-700/30",
];

/**
 * Constructs a Google Drive folder URL from a folder ID or returns the URL if already a valid URL
 */
export function getGoogleDriveUrl(
	input: string | null | undefined,
): string | null {
	if (!input) return null;

	const trimmed = input.trim();
	if (!trimmed) return null;

	// If it's already a URL, return it directly
	if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
		return trimmed;
	}

	// Otherwise, construct the URL from the folder ID
	return `https://drive.google.com/drive/folders/${trimmed}`;
}
