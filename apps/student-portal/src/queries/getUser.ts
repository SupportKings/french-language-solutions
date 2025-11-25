"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export const getUser = async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	return session;
};
