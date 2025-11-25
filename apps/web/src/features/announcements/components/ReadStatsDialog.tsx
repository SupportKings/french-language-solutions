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

	const readCount = stats?.filter((s) => s.has_read).length || 0;
	const totalCount = stats?.length || 0;
	const unreadCount = totalCount - readCount;

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
						<ScrollArea className="h-[400px] rounded-lg border">
							<div className="space-y-2 p-4">
								{stats && stats.length > 0 ? (
									stats.map((stat) => {
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

												<div className="flex flex-shrink-0 items-center gap-2">
													{stat.has_read ? (
														<Badge
															variant="outline"
															className="border-green-600/20 text-green-600"
														>
															Read
															{stat.read_at && (
																<span className="ml-1 text-xs">
																	{format(parseISO(stat.read_at), "MMM d")}
																</span>
															)}
														</Badge>
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
									})
								) : (
									<div className="py-8 text-center text-muted-foreground">
										No students found
									</div>
								)}
							</div>
						</ScrollArea>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
