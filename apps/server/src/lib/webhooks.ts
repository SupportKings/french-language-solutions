/**
 * Webhook Configuration
 *
 * WEBHOOK PURPOSES:
 * - cohortSetup: Creates Google Calendar events when cohort setup is finalized
 * - followUpTriggered: Automated email/SMS sequences for follow-ups
 */

export const webhooks = {
	make: {
		// Cohort Management
		cohortSetup: "https://hook.us2.make.com/gcqt42iur4lpbcovbcztrgce88g9xbbe",

		// Follow-up & Communication
		followUpTriggered:
			"https://hook.us2.make.com/71afzg8jb9pgft3m9tiidput88jl5buv",

		// Abandoned Enrollments Processing
		abandonedEnrollments:
			"https://hook.us2.make.com/uq8wedjms4ou7qo5gpms3thm34375wjm",
	},
} as const;

/**
 * Check if a webhook URL is configured (not a placeholder)
 */
export function isWebhookConfigured(
	provider: keyof typeof webhooks,
	webhookKey: string,
): boolean {
	const providerWebhooks = webhooks[provider] as Record<string, string>;
	const url = providerWebhooks[webhookKey];

	// Check if URL exists and is not a placeholder
	return Boolean(url);
}

/**
 * Get webhook URL safely
 */
export function getWebhookUrl(
	provider: keyof typeof webhooks,
	webhookKey: string,
): string | null {
	if (!isWebhookConfigured(provider, webhookKey)) {
		return null;
	}

	const providerWebhooks = webhooks[provider] as Record<string, string>;
	return providerWebhooks[webhookKey];
}

/**
 * Helper function to trigger a webhook safely
 * Returns true if webhook was sent, false if not configured or failed
 */
export async function triggerWebhook(
	provider: keyof typeof webhooks,
	webhookKey: string,
	payload: Record<string, any>,
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
	try {
		if (!isWebhookConfigured(provider, webhookKey)) {
			return {
				success: false,
				error: `Webhook ${provider}.${webhookKey} not configured`,
			};
		}

		const url = getWebhookUrl(provider, webhookKey);
		if (!url) {
			return {
				success: false,
				error: `Webhook ${provider}.${webhookKey} URL not found`,
			};
		}

		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const errorText = await response.text();
			return {
				success: false,
				statusCode: response.status,
				error: `Webhook failed: ${response.status} - ${errorText}`,
			};
		}

		return { success: true, statusCode: response.status };
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return { success: false, error: `Webhook error: ${errorMessage}` };
	}
}
