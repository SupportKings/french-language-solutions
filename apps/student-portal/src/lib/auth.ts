import { sendOTP } from "@/features/auth/actions/sendOtp";

import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { Pool } from "pg";

export const auth = betterAuth({
	database: new Pool({
		connectionString: process.env.BETTER_AUTH_DATABASE_URL,
	}),
	user: {
		additionalFields: {
			bio: {
				type: "string",
			},
			calendar_link: {
				type: "string",
			},
		},
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // Cache duration in seconds
		},
	},
	trustedOrigins: [
		"http://localhost:3003",
		"https://student.frenchlanguagesolutions.com",
		process.env.NEXT_PUBLIC_VERCEL_URL,
		process.env.NEXT_PUBLIC_APP_URL,
	].filter(Boolean) as string[],

	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
	},
	advanced: {
		cookiePrefix: "fls-student",
	},
	plugins: [
		passkey(),
		emailOTP({
			disableSignUp: true,
			async sendVerificationOTP({ email, otp, type }) {
				switch (type) {
					case "sign-in":
						await sendOTP({ email, otp, type });
						break;
					case "email-verification":
						break;
					default:
				}
			},
		}),
		nextCookies(),
	],
});
