import { type NextRequest, NextResponse } from "next/server";

import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request, {
		cookiePrefix: "fls-student",
	});
	const isLoginPage = request.nextUrl.pathname === "/";
	const isProtectedRoute =
		request.nextUrl.pathname.startsWith("/dashboard") ||
		request.nextUrl.pathname.startsWith("/profile");

	// Redirect authenticated users from login to dashboard
	if (sessionCookie && isLoginPage) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// Redirect unauthenticated users from protected routes to login
	if (!sessionCookie && isProtectedRoute) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/", "/dashboard/:path*", "/profile/:path*"],
};
