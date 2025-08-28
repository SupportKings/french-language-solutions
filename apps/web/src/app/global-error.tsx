"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to console for debugging
		console.error("Global error occurred:", error);
	}, [error]);

	return (
		<html lang="en">
			<body>
				<div className="flex min-h-screen items-center justify-center bg-background p-4">
					<Card className="w-full max-w-md">
						<CardHeader className="text-center">
							<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
								<svg
									className="h-6 w-6 text-red-600 dark:text-red-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
									/>
								</svg>
							</div>
							<CardTitle className="text-xl">Something went wrong!</CardTitle>
							<CardDescription>
								An unexpected error occurred. Please send this information to
								OpsKings in Slack.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="rounded-lg bg-muted p-3">
								<p className="mb-2 font-medium text-muted-foreground text-sm">
									Error Details:
								</p>
								<p className="break-words text-muted-foreground text-sm">
									{error.message || "Unknown error occurred"}
								</p>
								{error.digest && (
									<p className="mt-1 text-muted-foreground text-xs">
										Error ID: {error.digest}
									</p>
								)}
							</div>

							<div className="rounded-lg bg-muted p-3">
								<p className="mb-2 font-medium text-muted-foreground text-sm">
									Context Information:
								</p>
								<p className="break-all text-muted-foreground text-xs">
									Page:{" "}
									{typeof window !== "undefined"
										? window.location.href
										: "Unknown"}
								</p>
								<p className="text-muted-foreground text-xs">
									Time: {new Date().toLocaleString()}
								</p>
								<p className="mt-2 text-muted-foreground text-xs">
									Please include additional context like:
								</p>
								<ul className="mt-1 ml-4 list-disc text-muted-foreground text-xs">
									<li>What you were trying to do</li>
									<li>Ticket ID (if applicable)</li>
									<li>Client name/ID (if applicable)</li>
									<li>Any specific steps that led to this error</li>
								</ul>
							</div>

							<div className="flex flex-col gap-2">
								<Button onClick={reset} className="w-full">
									Try Again
								</Button>
							</div>

							<p className="text-center text-muted-foreground text-xs">
								Please send this information to OpsKings in Slack and we'll get
								to it as soon as possible.
							</p>
						</CardContent>
					</Card>
				</div>
			</body>
		</html>
	);
}
