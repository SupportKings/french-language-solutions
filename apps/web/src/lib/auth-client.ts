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

import { createAuthClient } from "better-auth/client";
import {
	adminClient,
	emailOTPClient,
	passkeyClient,
} from "better-auth/client/plugins";
export const authClient = createAuthClient({
	plugins: [
		emailOTPClient(),
		passkeyClient(),

		adminClient({
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
	],
});
