import { type NextRequest, NextResponse } from "next/server";

import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
	const isHomePage = request.nextUrl.pathname === "/";
	const isAdminPage = request.nextUrl.pathname.startsWith("/admin");

	// Redirect authenticated users from home to admin
	if (sessionCookie && isHomePage) {
		return NextResponse.redirect(new URL("/admin", request.url));
	}

	// Redirect unauthenticated users from admin to home
	if (!sessionCookie && isAdminPage) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/", "/admin/:path*"], // Match root and all admin routes
};
