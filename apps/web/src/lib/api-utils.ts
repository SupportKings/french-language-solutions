/**
 * Helper to get the correct base URL for API calls
 * Works both on server and client side
 */
export function getApiUrl(path: string): string {
	if (typeof window === "undefined") {
		// Server-side: use absolute URL
		// Priority: VERCEL_URL (for Vercel deployments) > NEXT_PUBLIC_APP_URL > localhost
		if (process.env.VERCEL_URL) {
			return `https://${process.env.VERCEL_URL}${path}`;
		}
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
		return `${baseUrl}${path}`;
	}
	// Client-side: use relative URL
	return path;
}

/**
 * Get the base URL for the application
 */
export function getBaseUrl(): string {
	if (typeof window === "undefined") {
		// Server-side
		// Priority: VERCEL_URL (for Vercel deployments) > NEXT_PUBLIC_APP_URL > localhost
		if (process.env.VERCEL_URL) {
			return `https://${process.env.VERCEL_URL}`;
		}
		return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
	}
	// Client-side
	return window.location.origin;
}
