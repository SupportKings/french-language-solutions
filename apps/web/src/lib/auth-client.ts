import { ac, admin, teacher } from "@/lib/permissions";

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
				teacher,
			},
		}),
	],
});
