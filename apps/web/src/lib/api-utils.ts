/**
 * Helper to get the correct base URL for API calls
 * Works both on server and client side
 */
export function getApiUrl(path: string): string {
	if (typeof window === "undefined") {
		// Server-side: use absolute URL
		// For Vercel deployments, always use VERCEL_URL which matches the current deployment
		// For local development, use NEXT_PUBLIC_APP_URL or localhost
		console.log("Server-side: use absolute URL");
		console.log(process.env.VERCEL_URL, "VERCEL_URL");
		console.log(process.env.NEXT_PUBLIC_APP_URL, "NEXT_PUBLIC_APP_URL");
		
		if (process.env.NEXT_PUBLIC_APP_URL) {
			return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
		}

		if (process.env.VERCEL_URL) {
			// VERCEL_URL is automatically set to the current deployment URL (production or preview)
			return `https://${process.env.VERCEL_URL}${path}`;
		}
		
		// Local development fallback
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
		return `${baseUrl}${path}`;
	}
	// Client-side: use relative URL (works for both production and preview)
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
