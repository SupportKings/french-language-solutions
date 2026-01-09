"use client";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Users } from "lucide-react";
import { chatsQueries } from "../queries/chats.queries";
import type { CohortMember } from "../types";

interface ChatMembersSidebarProps {
	cohortId?: string;
	conversationId?: string;
	currentUserId?: string;
	className?: string;
}

// Get initials from name
function getInitials(name: string | null): string {
	if (!name) return "?";
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

// Format enrollment status for display
function formatStatus(status: string): string {
	return status
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

// Get badge variant for enrollment status
function getStatusBadgeClass(status: string): {
	container: string;
	text: string;
} {
	switch (status) {
		case "paid":
			return {
				container: "bg-green-500/10 border-green-200",
				text: "text-green-700",
			};
		case "welcome_package_sent":
			return {
				container: "bg-blue-500/10 border-blue-200",
				text: "text-blue-700",
			};
		case "transitioning":
			return {
				container: "bg-yellow-500/10 border-yellow-200",
				text: "text-yellow-700",
			};
		case "offboarding":
			return {
				container: "bg-orange-500/10 border-orange-200",
				text: "text-orange-700",
			};
		default:
			return {
				container: "bg-muted border-border",
				text: "text-muted-foreground",
			};
	}
}

function MemberItem({
	member,
	isCurrentUser,
}: {
	member: CohortMember;
	isCurrentUser: boolean;
}) {
	const statusClasses = member.enrollmentStatus
		? getStatusBadgeClass(member.enrollmentStatus)
		: null;

	const hasNoAccess = !member.userId;

	return (
		<div
			className={cn(
				"flex items-start gap-2 overflow-hidden px-3 py-2.5 transition-colors hover:bg-muted/30",
				isCurrentUser && "bg-muted/20",
			)}
		>
			{/* Avatar */}
			<Avatar className="h-8 w-8 shrink-0">
				<AvatarImage src={member.image || ""} alt={member.name || "Member"} />
				<AvatarFallback className="bg-primary/10 font-semibold text-primary text-xs">
					{getInitials(member.name)}
				</AvatarFallback>
			</Avatar>

			{/* Member Info + Badges */}
			<div className="flex min-w-0 flex-1 flex-col gap-1 overflow-hidden">
				{/* Name */}
				<p className="truncate font-medium text-sm">
					{member.name || member.email}
					{isCurrentUser && (
						<span className="ml-1 text-muted-foreground text-xs">(you)</span>
					)}
				</p>

				{/* Badges and Indicators Row */}
				{(hasNoAccess ||
					(member.role === "student" &&
						member.enrollmentStatus &&
						statusClasses)) && (
					<div className="flex items-center gap-1.5">
						{/* No Portal Access Indicator */}
						{hasNoAccess && (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<AlertCircle className="h-3.5 w-3.5 shrink-0 cursor-help text-red-500" />
									</TooltipTrigger>
									<TooltipContent>
										<p>No portal access</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						)}

						{/* Status Badge (for students only) */}
						{member.role === "student" &&
							member.enrollmentStatus &&
							statusClasses && (
								<Badge
									variant="outline"
									className={cn(
										"shrink-0 px-1.5 py-0.5 text-[10px] leading-none",
										statusClasses.container,
										statusClasses.text,
									)}
								>
									{formatStatus(member.enrollmentStatus)}
								</Badge>
							)}
					</div>
				)}
			</div>
		</div>
	);
}

export function ChatMembersSidebar({
	cohortId,
	conversationId,
	currentUserId,
	className,
}: ChatMembersSidebarProps) {
	// Fetch cohort members or conversation participants
	const {
		data: cohortData,
		isLoading: isLoadingCohort,
		isError: isErrorCohort,
	} = useQuery({
		...chatsQueries.members(cohortId || ""),
		enabled: !!cohortId,
	});

	const {
		data: conversationData,
		isLoading: isLoadingConversation,
		isError: isErrorConversation,
	} = useQuery({
		...chatsQueries.conversationParticipants(conversationId || ""),
		enabled: !!conversationId,
	});

	const data = cohortId ? cohortData : conversationData;
	const isLoading = cohortId ? isLoadingCohort : isLoadingConversation;
	const isError = cohortId ? isErrorCohort : isErrorConversation;

	// Loading State
	if (isLoading) {
		return (
			<div
				className={cn(
					"flex w-[320px] flex-col border-border/50 border-l bg-muted/20",
					className,
				)}
			>
				<div className="border-border border-b bg-muted/30 px-4 py-3 backdrop-blur-sm">
					<Skeleton className="h-5 w-24" />
				</div>
				<div className="space-y-3 p-4">
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={i} className="flex items-center gap-3">
							<Skeleton className="h-9 w-9 rounded-full" />
							<Skeleton className="h-4 flex-1" />
						</div>
					))}
				</div>
			</div>
		);
	}

	// Error State
	if (isError || !data) {
		return (
			<div
				className={cn(
					"flex w-[320px] flex-col border-border/50 border-l bg-muted/20",
					className,
				)}
			>
				<div className="border-border border-b bg-muted/30 px-4 py-3 backdrop-blur-sm">
					<h3 className="font-semibold text-sm">Members</h3>
				</div>
				<div className="flex flex-1 items-center justify-center p-8">
					<div className="text-center text-muted-foreground text-sm">
						<Users className="mx-auto mb-2 h-8 w-8 opacity-50" />
						<p>Failed to load members</p>
					</div>
				</div>
			</div>
		);
	}

	// Transform conversation data to match cohort data structure
	const displayData: any =
		conversationId && conversationData
			? (() => {
					const mapped = conversationData.participants.map((p: any) => ({
						id: p.userId,
						userId: p.userId,
						name: p.name,
						email: p.email,
						image: p.image || null,
						role: p.role || "student",
					}));

					// Separate by role
					const teachers = mapped.filter(
						(p: any) =>
							p.role === "teacher" ||
							p.role === "admin" ||
							p.role === "super_admin",
					);
					const students = mapped.filter((p: any) => p.role === "student");

					return {
						teachers,
						students,
						totalCount: mapped.length,
					};
				})()
			: data;

	// Empty State
	if (!displayData || displayData?.totalCount === 0) {
		return (
			<div
				className={cn(
					"flex w-[300px] flex-col border-border/50 border-l bg-muted/20",
					className,
				)}
			>
				<div className="border-border border-b bg-muted/30 px-4 py-3 backdrop-blur-sm">
					<h3 className="font-semibold text-sm">
						{conversationId ? "Participants (0)" : "Members (0)"}
					</h3>
				</div>
				<div className="flex flex-1 items-center justify-center p-8">
					<div className="text-center text-muted-foreground text-sm">
						<Users className="mx-auto mb-2 h-8 w-8 opacity-50" />
						<p>
							{conversationId ? "No participants" : "No members in this cohort"}
						</p>
					</div>
				</div>
			</div>
		);
	}

	const { teachers, students, totalCount } = displayData;

	return (
		<div
			className={cn(
				"flex w-[300px] flex-col border-border/50 border-l bg-muted/20",
				className,
			)}
		>
			{/* Header */}
			<div className="border-border border-b bg-muted/30 px-4 py-3 backdrop-blur-sm">
				<h3 className="font-semibold text-sm">
					{conversationId
						? `Participants (${totalCount})`
						: `Members (${totalCount})`}
				</h3>
			</div>

			{/* Members List */}
			<ScrollArea className="flex-1">
				{/* Teachers Section */}
				{teachers.length > 0 && (
					<div className="py-2">
						<div className="px-4 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
							Teachers ({teachers.length})
						</div>
						{teachers.map((teacher: CohortMember) => (
							<MemberItem
								key={teacher.id}
								member={teacher}
								isCurrentUser={teacher.userId === currentUserId}
							/>
						))}
					</div>
				)}

				{/* Students Section */}
				{students.length > 0 && (
					<div className="py-2">
						<div className="px-4 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
							Students ({students.length})
						</div>
						{students.map((student: CohortMember) => (
							<MemberItem
								key={student.id}
								member={student}
								isCurrentUser={student.userId === currentUserId}
							/>
						))}
					</div>
				)}
			</ScrollArea>
		</div>
	);
}
