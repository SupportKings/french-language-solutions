export interface MakeWebhookHeaders {
	"x-make-signature"?: string;
	"x-make-scenario"?: string;
	"x-make-execution"?: string;
}

export interface WebhookResponse<T = any> {
	success: boolean;
	message?: string;
	data?: T;
	error?: {
		code: string;
		message: string;
	};
}

export enum WebhookError {
	INVALID_SIGNATURE = "INVALID_SIGNATURE",
	INVALID_PAYLOAD = "INVALID_PAYLOAD",
	VALIDATION_ERROR = "VALIDATION_ERROR",
	NOT_FOUND = "NOT_FOUND",
	DATABASE_ERROR = "DATABASE_ERROR",
	INTERNAL_ERROR = "INTERNAL_ERROR",
}
