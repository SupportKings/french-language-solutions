interface AccessDeniedProps {
	title?: string;
	message?: string;
	backLink?: string;
	backLinkText?: string;
}

export function AccessDenied({
	title = "Access Denied",
	message = "You don't have permission to access this resource.",
	backLink = "/admin",
	backLinkText = "Go Back",
}: AccessDeniedProps) {
	return (
		<div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
			<div className="rounded-full bg-destructive/10 p-4">
				<svg
					className="h-12 w-12 text-destructive"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
			</div>
			<div className="space-y-2">
				<h1 className="font-bold text-2xl">{title}</h1>
				<p className="max-w-md text-muted-foreground">{message}</p>
			</div>
			<a
				href={backLink}
				className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
			>
				{backLinkText}
			</a>
		</div>
	);
}
