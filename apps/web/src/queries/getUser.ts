"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

//for server side usage in rscs
export const getUser = async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	return session;
};
