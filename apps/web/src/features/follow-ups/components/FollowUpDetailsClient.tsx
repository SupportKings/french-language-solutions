"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { EditableSection } from "@/components/inline-edit/EditableSection";
import { InlineEditField } from "@/components/inline-edit/InlineEditField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { format } from "date-fns";
import {
	Activity,
	ArrowLeft,
	Calendar,
	CheckCircle,
	Clock,
	Eye,
	Mail,
	MapPin,
	MessageSquare,
	Phone,
	Send,
	User,
	UserCircle,
	XCircle,
} from "lucide-react";
import { useQueryState } from "nuqs";
import { toast } from "sonner";

const statusColors = {
	activated: "info",
	in_progress: "warning",
	completed: "success",
	stopped: "destructive",
};

const statusLabels = {
	activated: "Activated",
	in_progress: "In Progress",
	completed: "Completed",
	stopped: "Stopped",
};

const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
	value,
	label,
}));

interface FollowUpDetailsClientProps {
	followUp: any;
}

export function FollowUpDetailsClient({
	followUp: initialFollowUp,
}: FollowUpDetailsClientProps) {
	const router = useRouter();
	const [followUp, setFollowUp] = useState(initialFollowUp);

	// Get redirectTo param from URL
	const [redirectTo] = useQueryState("redirectTo", {
		defaultValue: "/admin/automation/automated-follow-ups",
	});

	// Get student initials for avatar
	const studentInitials =
		followUp.student?.full_name
			?.split(" ")
			.map((n: string) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2) || "FU";

	const handleUpdate = async (field: string, value: any) => {
		try {
			// Convert field names to API format
			const apiField = field.includes("_")
				? field
				: field.replace(/([A-Z])/g, "_$1").toLowerCase();

			const response = await fetch(`/api/automated-follow-ups/${followUp.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ [apiField]: value }),
			});

			if (!response.ok) throw new Error("Failed to update follow-up");

			const updated = await response.json();
			setFollowUp({ ...followUp, ...updated });
			toast.success("Follow-up updated successfully");
		} catch (error) {
			console.error("Error updating follow-up:", error);
			toast.error("Failed to update follow-up");
			throw error;
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
			<div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<Link href={redirectTo}>
						<Button variant="ghost" size="sm" className="mb-4">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Button>
					</Link>

					<div className="flex items-start justify-between">
						<div className="flex items-start gap-4">
							{/* Student Avatar */}
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
								<span className="font-semibold text-primary text-xl">
									{studentInitials}
								</span>
							</div>

							<div className="space-y-1">
								<div className="flex items-center gap-3">
									<h1 className="font-bold text-3xl tracking-tight">
										{followUp.student?.full_name || "Follow-up Details"}
									</h1>
									<Badge
										variant={
											(statusColors as any)[followUp.status] || "default"
										}
										className="px-3 py-1"
									>
										{(statusLabels as any)[followUp.status] || followUp.status}
									</Badge>
								</div>
								<p className="text-muted-foreground">
									Sequence: {followUp.sequence?.display_name || "Unknown"} •{" "}
									{followUp.started_at
										? `Started ${format(new Date(followUp.started_at), "MMM d, yyyy")}`
										: "Not started"}
								</p>
							</div>
						</div>

						{/* Actions */}
						<div className="flex items-center gap-2">
							<Link href={`/admin/students/${followUp.student_id}`}>
								<Button variant="outline" size="sm">
									<Eye className="mr-2 h-4 w-4" />
									View Student
								</Button>
							</Link>
						</div>
					</div>
				</div>

				{/* Main Content Card */}
				<Card className="border-border/50 bg-card/95 shadow-xl backdrop-blur-sm">
					<CardContent className="p-0">
						{/* Quick Stats */}
						<div className="border-border/50 border-b bg-muted/30 px-6 py-4">
							<div className="grid grid-cols-2 gap-6 md:grid-cols-4">
								<div className="space-y-1">
									<p className="text-muted-foreground text-xs">Status</p>
									<Badge
										variant={
											(statusColors as any)[followUp.status] || "default"
										}
									>
										{(statusLabels as any)[followUp.status] || followUp.status}
									</Badge>
								</div>
								<div className="space-y-1">
									<p className="text-muted-foreground text-xs">Messages</p>
									<p className="font-medium text-sm">
										{followUp.touchpoints?.length || 0}
									</p>
								</div>
								<div className="space-y-1">
									<p className="text-muted-foreground text-xs">Started</p>
									<p className="font-medium text-sm">
										{followUp.started_at
											? format(new Date(followUp.started_at), "MMM d, yyyy")
											: "Not started"}
									</p>
								</div>
								<div className="space-y-1">
									<p className="text-muted-foreground text-xs">Last Message</p>
									<p className="font-medium text-sm">
										{followUp.last_message_sent_at
											? format(new Date(followUp.last_message_sent_at), "MMM d")
											: "No messages"}
									</p>
								</div>
							</div>
						</div>

						<div className="space-y-4 px-6 py-4">
							{/* Follow-up Information Section */}
							<EditableSection title="Follow-up Information">
								{(editing) => (
									<div className="grid gap-8 lg:grid-cols-2">
										<div className="space-y-4">
											<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
												Follow-up Details
											</h3>
											<div className="space-y-3">
												<div className="flex items-start gap-3">
													<Activity className="mt-0.5 h-4 w-4 text-muted-foreground" />
													<div className="flex-1 space-y-0.5">
														<p className="text-muted-foreground text-xs">
															Status:
														</p>
														{editing ? (
															<InlineEditField
																value={followUp.status}
																onSave={(value) =>
																	handleUpdate("status", value)
																}
																editing={editing}
																type="select"
																options={statusOptions}
															/>
														) : (
															<Badge
																variant={
																	(statusColors as any)[followUp.status] ||
																	"default"
																}
																className="mt-1"
															>
																{(statusLabels as any)[followUp.status] ||
																	followUp.status}
															</Badge>
														)}
													</div>
												</div>

												<div className="flex items-start gap-3">
													<Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
													<div className="flex-1 space-y-0.5">
														<p className="text-muted-foreground text-xs">
															Started At:
														</p>
														{editing ? (
															<InlineEditField
																value={
																	followUp.started_at
																		? new Date(followUp.started_at)
																				.toISOString()
																				.slice(0, 16)
																		: ""
																}
																onSave={(value) =>
																	handleUpdate(
																		"started_at",
																		value
																			? new Date(value).toISOString()
																			: null,
																	)
																}
																editing={editing}
																type="text"
																placeholder="YYYY-MM-DDTHH:MM"
															/>
														) : followUp.started_at ? (
															<p className="font-medium text-sm">
																{format(
																	new Date(followUp.started_at),
																	"MMMM d, yyyy 'at' h:mm a",
																)}
															</p>
														) : (
															<span className="text-muted-foreground text-sm">
																Not started
															</span>
														)}
													</div>
												</div>

												{followUp.last_message_sent_at && (
													<div className="flex items-start gap-3">
														<Send className="mt-0.5 h-4 w-4 text-muted-foreground" />
														<div className="flex-1 space-y-0.5">
															<p className="text-muted-foreground text-xs">
																Last Message:
															</p>
															<p className="font-medium text-sm">
																{format(
																	new Date(followUp.last_message_sent_at),
																	"MMMM d, yyyy 'at' h:mm a",
																)}
															</p>
														</div>
													</div>
												)}
											</div>
										</div>

										<div className="space-y-4">
											<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
												Sequence Details
											</h3>
											<div className="space-y-3">
												<div className="rounded-lg border bg-muted/10 p-3">
													<p className="mb-1 text-muted-foreground text-xs">
														Sequence Name
													</p>
													<p className="font-medium text-sm">
														{followUp.sequence?.display_name ||
															"Unknown Sequence"}
													</p>
												</div>
												<div className="rounded-lg border bg-muted/10 p-3">
													<p className="mb-1 text-muted-foreground text-xs">
														Subject
													</p>
													<p className="font-medium text-sm">
														{followUp.sequence?.subject || "No subject"}
													</p>
												</div>
												<div className="rounded-lg border bg-muted/10 p-3">
													<p className="mb-1 text-muted-foreground text-xs">
														Messages Sent
													</p>
													<p className="font-medium text-sm">
														{followUp.touchpoints?.length || 0}
													</p>
												</div>
											</div>
										</div>
									</div>
								)}
							</EditableSection>

							{/* Tabs for Student Information */}
							<div className="mt-6">
								<Tabs defaultValue="student" className="w-full">
									{/* Student Information Tab */}
									<TabsContent value="student" className="mt-4">
										<Card className="border-border/50">
											<CardHeader className="pb-3">
												<CardTitle className="text-base">
													Student Information
												</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="grid gap-6 lg:grid-cols-2">
													<div className="space-y-3">
														<div className="flex items-start gap-3">
															<User className="mt-0.5 h-4 w-4 text-muted-foreground" />
															<div className="flex-1 space-y-0.5">
																<p className="text-muted-foreground text-xs">
																	Full Name:
																</p>
																<div className="flex items-center gap-2">
																	<p className="font-medium text-sm">
																		{followUp.student?.full_name}
																	</p>
																	<Link
																		href={`/admin/students/${followUp.student_id}`}
																	>
																		<Button
																			variant="ghost"
																			size="sm"
																			className="h-6 px-2"
																		>
																			<Eye className="h-3 w-3" />
																		</Button>
																	</Link>
																</div>
															</div>
														</div>

														<div className="flex items-start gap-3">
															<Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
															<div className="flex-1 space-y-0.5">
																<p className="text-muted-foreground text-xs">
																	Email:
																</p>
																<p className="font-medium text-sm">
																	{followUp.student?.email || "Not provided"}
																</p>
															</div>
														</div>
													</div>

													<div className="space-y-3">
														<div className="flex items-start gap-3">
															<Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
															<div className="flex-1 space-y-0.5">
																<p className="text-muted-foreground text-xs">
																	Phone:
																</p>
																<p className="font-medium text-sm">
																	{followUp.student?.mobile_phone_number ||
																		"Not provided"}
																</p>
															</div>
														</div>
													</div>
												</div>
											</CardContent>
										</Card>
									</TabsContent>
								</Tabs>
							</div>

							{/* System Information */}
							<Card className="border-border/50 bg-muted/10">
								<CardHeader className="pb-3">
									<CardTitle className="text-muted-foreground text-sm">
										System Information
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
										<div className="space-y-1">
											<p className="text-muted-foreground text-xs">
												Follow-up ID
											</p>
											<p className="font-mono text-muted-foreground text-xs">
												{followUp.id}
											</p>
										</div>
										<div className="space-y-1">
											<p className="text-muted-foreground text-xs">
												Created Date
											</p>
											<p className="text-sm">
												{format(new Date(followUp.created_at), "MMM d, yyyy")}
											</p>
										</div>
										<div className="space-y-1">
											<p className="text-muted-foreground text-xs">
												Last Updated
											</p>
											<p className="text-sm">
												{format(
													new Date(followUp.updated_at || followUp.created_at),
													"MMM d, yyyy",
												)}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
