import {
	ac,
	admin,
	billingAdmin,
	coach,
	cpo,
	csc,
	csManager,
	csRep,
	finance,
	premiereCoach,
	salesRep,
	user,
} from "@/lib/permissions";

// import { createClient } from "@/utils/supabase/server";

import { sendOTP } from "@/features/auth/actions/sendOtp";

import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import {
	admin as adminPlugin,
	createAuthMiddleware,
	emailOTP,
} from "better-auth/plugins";
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
	//needs for consistent ip tracking for sessions
	trustedOrigins: [
		"http://localhost:3000",
		"http://localhost:3001",
		"https://frenchlanguagesolutions.vercel.app/",
		process.env.NEXT_PUBLIC_VERCEL_URL,
		process.env.NEXT_PUBLIC_APP_URL,
	].filter(Boolean) as string[],

	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
	},
	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			const userId = ctx.context.session?.user.id;

			if (!userId) return;

			// TODO: Implement set_user_id RPC function in Supabase
			// const supabase = await createClient();

			// try {
			// 	await supabase.rpc("set_user_id", { user_id: userId });
			// } catch (err) {
			// 	console.error("Failed to set user_id", err);
			// }
		}),
	},
	plugins: [
		passkey(),

		adminPlugin({
			ac,
			roles: {
				admin,
				user,
				coach,
				premiereCoach,
				cpo,
				csManager,
				csRep,
				csc,
				finance,
				billingAdmin,
				salesRep,
			},
		}),
		// Email OTP Plugin
		emailOTP({
			disableSignUp: true,
			async sendVerificationOTP({ email, otp, type }) {
				switch (type) {
					case "sign-in":
						console.log("sign-in", email, otp, type);
						await sendOTP({ email, otp, type });
						break;
					case "email-verification":
						/* 						await sendOTP({ email, otp, type });
						 */ break;
					default:
					/* 						await sendOTP({ email, otp, type });
					 */
				}
			},
		}),
		nextCookies(), // nextcookies has to be the last plugin in the array
	],
});
