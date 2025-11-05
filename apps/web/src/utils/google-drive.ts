/**
 * Utility functions for working with Google Drive
 */

/**
 * Extracts the folder ID from a Google Drive folder URL or returns the ID if already provided
 *
 * Supports the following formats:
 * - Full URL: https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j
 * - Full URL with parameters: https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j?usp=sharing
 * - Direct ID: 1a2b3c4d5e6f7g8h9i0j
 *
 * @param input - The Google Drive folder URL or ID
 * @returns The extracted folder ID, or null if the input is invalid
 *
 * @example
 * extractGoogleDriveFolderId("https://drive.google.com/drive/folders/abc123")
 * // Returns: "abc123"
 *
 * extractGoogleDriveFolderId("abc123")
 * // Returns: "abc123"
 *
 * extractGoogleDriveFolderId("")
 * // Returns: null
 */
export function extractGoogleDriveFolderId(input: string | null | undefined): string | null {
	if (!input) return null;

	const trimmed = input.trim();
	if (!trimmed) return null;

	// Pattern 1: Full URL - https://drive.google.com/drive/folders/FOLDER_ID
	// Also handles URLs with query parameters like ?usp=sharing
	const urlMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
	if (urlMatch) {
		return urlMatch[1];
	}

	// Pattern 2: Direct ID (alphanumeric with hyphens/underscores)
	// Google Drive folder IDs are typically 25-50 characters
	const idMatch = trimmed.match(/^([a-zA-Z0-9_-]{10,})$/);
	if (idMatch) {
		return idMatch[1];
	}

	// Invalid format
	return null;
}

/**
 * Constructs a Google Drive folder URL from a folder ID
 *
 * @param folderId - The Google Drive folder ID
 * @returns The full Google Drive folder URL, or null if the ID is invalid
 *
 * @example
 * getGoogleDriveFolderUrl("abc123")
 * // Returns: "https://drive.google.com/drive/folders/abc123"
 */
export function getGoogleDriveFolderUrl(folderId: string | null | undefined): string | null {
	if (!folderId) return null;

	const trimmed = folderId.trim();
	if (!trimmed) return null;

	return `https://drive.google.com/drive/folders/${trimmed}`;
}
