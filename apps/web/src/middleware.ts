import { type NextRequest, NextResponse } from "next/server";

import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
	// TEMPORARY: Bypass auth check for development
	// Comment out the middleware logic to allow access without authentication
	return NextResponse.next();
	
	/* ORIGINAL MIDDLEWARE - COMMENTED FOR TEMPORARY BYPASS
	const sessionCookie = getSessionCookie(request);
	const isHomePage = request.nextUrl.pathname === "/";
	const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

	// Redirect authenticated users from home to dashboard
	if (sessionCookie && isHomePage) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// Redirect unauthenticated users from dashboard to home
	if (!sessionCookie && isDashboardPage) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
	*/
}

export const config = {
	matcher: ["/", "/dashboard/:path*"], // Match root and all dashboard routes
};
