"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { announcementsQueries } from "../queries/announcements.queries";

interface ReadStatsDialogProps {
	announcementId: string | null;
	onClose: () => void;
}

export function ReadStatsDialog({
	announcementId,
	onClose,
}: ReadStatsDialogProps) {
	const { data: stats, isLoading } = useQuery({
		...announcementsQueries.readStats(announcementId!),
		enabled: !!announcementId,
	});

	const [displayCount, setDisplayCount] = useState(20);

	const readCount = stats?.filter((s) => s.has_read).length || 0;
	const totalCount = stats?.length || 0;
	const unreadCount = totalCount - readCount;

	const displayedStats = useMemo(
		() => stats?.slice(0, displayCount) || [],
		[stats, displayCount],
	);

	const hasMore = (stats?.length || 0) > displayCount;

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const target = e.target as HTMLDivElement;
		const { scrollTop, scrollHeight, clientHeight } = target;

		// Load more when user scrolls to bottom
		if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore) {
			setDisplayCount((prev) => prev + 20);
		}
	};

	return (
		<Dialog open={!!announcementId} onOpenChange={() => onClose()}>
			<DialogContent className="max-h-[80vh] max-w-2xl">
				<DialogHeader>
					<DialogTitle>Read Statistics</DialogTitle>
					<DialogDescription>
						See which students have read this announcement
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : (
					<div className="space-y-4">
						{/* Stats Summary */}
						<div className="grid grid-cols-3 gap-4">
							<div className="rounded-lg border bg-card p-4">
								<div className="font-bold text-2xl">{totalCount}</div>
								<div className="text-muted-foreground text-sm">
									Total Students
								</div>
							</div>
							<div className="rounded-lg border bg-card p-4">
								<div className="font-bold text-2xl text-green-600">
									{readCount}
								</div>
								<div className="text-muted-foreground text-sm">Read</div>
							</div>
							<div className="rounded-lg border bg-card p-4">
								<div className="font-bold text-2xl text-amber-600">
									{unreadCount}
								</div>
								<div className="text-muted-foreground text-sm">Unread</div>
							</div>
						</div>

						{/* Students List */}
						<div className="relative">
							<ScrollArea
								className="h-[400px] rounded-lg border"
								onScrollCapture={handleScroll}
							>
								<div className="space-y-2 p-4">
									{displayedStats && displayedStats.length > 0 ? (
										<>
											{displayedStats.map((stat) => {
												const initials = stat.student.full_name
													? stat.student.full_name
															.split(" ")
															.map((n) => n[0])
															.join("")
															.slice(0, 2)
													: "??";

												return (
													<div
														key={stat.student.id}
														className="flex items-center justify-between rounded-lg border bg-card/50 p-3 transition-colors hover:bg-card"
													>
														<div className="flex items-center gap-3">
															{stat.has_read ? (
																<CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
															) : (
																<Circle className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
															)}

															<Avatar className="h-9 w-9">
																<AvatarFallback className="text-xs">
																	{initials}
																</AvatarFallback>
															</Avatar>

															<div className="min-w-0">
																<p className="truncate font-medium text-sm">
																	{stat.student.full_name || "Unknown Student"}
																</p>
																<p className="truncate text-muted-foreground text-xs">
																	{stat.student.email}
																</p>
															</div>
														</div>

														<div className="flex flex-shrink-0 flex-col items-end gap-1">
															{stat.has_read ? (
																<>
																	<Badge
																		variant="outline"
																		className="border-green-600/20 text-green-600"
																	>
																		Read
																	</Badge>
																	{stat.read_at && (
																		<span className="text-muted-foreground text-xs">
																			Read at:{" "}
																			{format(parseISO(stat.read_at), "MMM d, yyyy")}
																		</span>
																	)}
																</>
															) : (
																<Badge
																	variant="outline"
																	className="text-muted-foreground"
																>
																	Unread
																</Badge>
															)}
														</div>
													</div>
												);
											})}
											{hasMore && (
												<div className="flex items-center justify-center py-4">
													<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
												</div>
											)}
										</>
									) : (
										<div className="py-8 text-center text-muted-foreground">
											No students found
										</div>
									)}
								</div>
							</ScrollArea>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
