interface EnrollmentDetailSkeletonProps {
	enrollmentId: string;
}

export default function EnrollmentDetailSkeleton({
	enrollmentId,
}: EnrollmentDetailSkeletonProps) {
	return (
		<div className="min-h-screen bg-muted/30">
			{/* Header skeleton */}
			<div className="border-b bg-background">
				<div className="px-6 py-3">
					<div className="mb-2 h-4 w-48 animate-pulse rounded bg-muted" />
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
							<div className="space-y-2">
								<div className="h-6 w-32 animate-pulse rounded bg-muted" />
								<div className="flex gap-2">
									<div className="h-4 w-20 animate-pulse rounded bg-muted" />
									<div className="h-4 w-24 animate-pulse rounded bg-muted" />
								</div>
							</div>
						</div>
						<div className="h-8 w-8 animate-pulse rounded bg-muted" />
					</div>
				</div>
			</div>

			<div className="space-y-4 px-6 py-4">
				{/* Cards skeleton */}
				<div className="rounded-lg border bg-background p-6">
					<div className="mb-4 h-6 w-40 animate-pulse rounded bg-muted" />
					<div className="grid gap-8 lg:grid-cols-3">
						{[...Array(3)].map((_, i) => (
							<div key={i} className="space-y-4">
								<div className="h-4 w-24 animate-pulse rounded bg-muted" />
								<div className="space-y-3">
									{[...Array(4)].map((_, j) => (
										<div key={j} className="space-y-2">
											<div className="h-3 w-16 animate-pulse rounded bg-muted" />
											<div className="h-4 w-full animate-pulse rounded bg-muted" />
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Tabs skeleton */}
				<div className="space-y-4">
					<div className="flex gap-4">
						{[...Array(3)].map((_, i) => (
							<div
								key={i}
								className="h-9 w-32 animate-pulse rounded bg-muted"
							/>
						))}
					</div>
					<div className="rounded-lg border bg-background p-6">
						<div className="mb-4 h-6 w-40 animate-pulse rounded bg-muted" />
						<div className="space-y-3">
							{[...Array(3)].map((_, j) => (
								<div
									key={j}
									className="flex items-center justify-between rounded-lg border p-3"
								>
									<div className="space-y-1">
										<div className="h-4 w-32 animate-pulse rounded bg-muted" />
										<div className="h-3 w-48 animate-pulse rounded bg-muted" />
									</div>
									<div className="h-3 w-24 animate-pulse rounded bg-muted" />
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
