"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditableSection } from "@/components/inline-edit/EditableSection";
import { InlineEditField } from "@/components/inline-edit/InlineEditField";
import { 
	User, 
	Calendar, 
	Mail,
	Phone,
	MapPin,
	Clock,
	CheckCircle,
	XCircle,
	Eye,
	ArrowLeft,
	UserCircle,
	Activity,
	Send,
	MessageSquare
} from "lucide-react";
import Link from "next/link";

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

export function FollowUpDetailsClient({ followUp: initialFollowUp }: FollowUpDetailsClientProps) {
	const router = useRouter();
	const [followUp, setFollowUp] = useState(initialFollowUp);
	
	// Get redirectTo param from URL
	const [redirectTo] = useQueryState("redirectTo", {
		defaultValue: "/admin/automation/automated-follow-ups"
	});

	// Get student initials for avatar
	const studentInitials = followUp.student?.full_name
		?.split(' ')
		.map((n: string) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2) || 'FU';

	const handleUpdate = async (field: string, value: any) => {
		try {
			// Convert field names to API format
			const apiField = field.includes('_') ? field : 
				field.replace(/([A-Z])/g, '_$1').toLowerCase();

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
			<div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
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
							<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
								<span className="text-xl font-semibold text-primary">
									{studentInitials}
								</span>
							</div>
							
							<div className="space-y-1">
								<div className="flex items-center gap-3">
									<h1 className="text-3xl font-bold tracking-tight">
										{followUp.student?.full_name || 'Follow-up Details'}
									</h1>
									<Badge variant={(statusColors as any)[followUp.status] || "default"} className="px-3 py-1">
										{(statusLabels as any)[followUp.status] || followUp.status}
									</Badge>
								</div>
								<p className="text-muted-foreground">
									Sequence: {followUp.sequence?.display_name || 'Unknown'} • 
									{' '}{followUp.started_at ? 
										`Started ${format(new Date(followUp.started_at), "MMM d, yyyy")}` : 
										'Not started'}
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
				<Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-xl">
					<CardContent className="p-0">
						{/* Quick Stats */}
						<div className="border-b border-border/50 bg-muted/30 px-6 py-4">
							<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
								<div className="space-y-1">
									<p className="text-xs text-muted-foreground">Status</p>
									<Badge variant={(statusColors as any)[followUp.status] || "default"}>
										{(statusLabels as any)[followUp.status] || followUp.status}
									</Badge>
								</div>
								<div className="space-y-1">
									<p className="text-xs text-muted-foreground">Messages</p>
									<p className="text-sm font-medium">
										{followUp.touchpoints?.length || 0}
									</p>
								</div>
								<div className="space-y-1">
									<p className="text-xs text-muted-foreground">Started</p>
									<p className="text-sm font-medium">
										{followUp.started_at ? 
											format(new Date(followUp.started_at), "MMM d, yyyy") : 
											"Not started"}
									</p>
								</div>
								<div className="space-y-1">
									<p className="text-xs text-muted-foreground">Last Message</p>
									<p className="text-sm font-medium">
										{followUp.last_message_sent_at ? 
											format(new Date(followUp.last_message_sent_at), "MMM d") : 
											"No messages"}
									</p>
								</div>
							</div>
						</div>

						<div className="px-6 py-4 space-y-4">
							{/* Follow-up Information Section */}
							<EditableSection title="Follow-up Information">
								{(editing) => (
									<div className="grid gap-8 lg:grid-cols-2">
										<div className="space-y-4">
											<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
												Follow-up Details
											</h3>
											<div className="space-y-3">
												<div className="flex items-start gap-3">
													<Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
													<div className="flex-1 space-y-0.5">
														<p className="text-xs text-muted-foreground">Status:</p>
														{editing ? (
															<InlineEditField
																value={followUp.status}
																onSave={(value) => handleUpdate("status", value)}
																editing={editing}
																type="select"
																options={statusOptions}
															/>
														) : (
															<Badge variant={(statusColors as any)[followUp.status] || "default"} className="mt-1">
																{(statusLabels as any)[followUp.status] || followUp.status}
															</Badge>
														)}
													</div>
												</div>

												<div className="flex items-start gap-3">
													<Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
													<div className="flex-1 space-y-0.5">
														<p className="text-xs text-muted-foreground">Started At:</p>
														{editing ? (
															<InlineEditField
																value={followUp.started_at ? new Date(followUp.started_at).toISOString().slice(0, 16) : ""}
																onSave={(value) => handleUpdate("started_at", value ? new Date(value).toISOString() : null)}
																editing={editing}
																type="text"
																placeholder="YYYY-MM-DDTHH:MM"
															/>
														) : followUp.started_at ? (
															<p className="text-sm font-medium">
																{format(new Date(followUp.started_at), "MMMM d, yyyy 'at' h:mm a")}
															</p>
														) : (
															<span className="text-sm text-muted-foreground">Not started</span>
														)}
													</div>
												</div>

												{followUp.last_message_sent_at && (
													<div className="flex items-start gap-3">
														<Send className="h-4 w-4 text-muted-foreground mt-0.5" />
														<div className="flex-1 space-y-0.5">
															<p className="text-xs text-muted-foreground">Last Message:</p>
															<p className="text-sm font-medium">
																{format(new Date(followUp.last_message_sent_at), "MMMM d, yyyy 'at' h:mm a")}
															</p>
														</div>
													</div>
												)}
											</div>
										</div>

										<div className="space-y-4">
											<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
												Sequence Details
											</h3>
											<div className="space-y-3">
												<div className="rounded-lg border bg-muted/10 p-3">
													<p className="text-xs text-muted-foreground mb-1">Sequence Name</p>
													<p className="text-sm font-medium">{followUp.sequence?.display_name || 'Unknown Sequence'}</p>
												</div>
												<div className="rounded-lg border bg-muted/10 p-3">
													<p className="text-xs text-muted-foreground mb-1">Subject</p>
													<p className="text-sm font-medium">{followUp.sequence?.subject || 'No subject'}</p>
												</div>
												<div className="rounded-lg border bg-muted/10 p-3">
													<p className="text-xs text-muted-foreground mb-1">Messages Sent</p>
													<p className="text-sm font-medium">{followUp.touchpoints?.length || 0}</p>
												</div>
											</div>
										</div>
									</div>
								)}
							</EditableSection>

							{/* Tabs for Student Information */}
							<div className="mt-6">
								<Tabs defaultValue="student" className="w-full">
									<TabsList className="grid grid-cols-1 w-[150px]">
										<TabsTrigger value="student" className="flex items-center gap-2">
											<UserCircle className="h-3.5 w-3.5" />
											Student Info
										</TabsTrigger>
									</TabsList>

									{/* Student Information Tab */}
									<TabsContent value="student" className="mt-4">
										<Card className="border-border/50">
											<CardHeader className="pb-3">
												<CardTitle className="text-base">Student Information</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="grid gap-6 lg:grid-cols-2">
													<div className="space-y-3">
														<div className="flex items-start gap-3">
															<User className="h-4 w-4 text-muted-foreground mt-0.5" />
															<div className="flex-1 space-y-0.5">
																<p className="text-xs text-muted-foreground">Full Name:</p>
																<div className="flex items-center gap-2">
																	<p className="text-sm font-medium">
																		{followUp.student?.full_name}
																	</p>
																	<Link href={`/admin/students/${followUp.student_id}`}>
																		<Button variant="ghost" size="sm" className="h-6 px-2">
																			<Eye className="h-3 w-3" />
																		</Button>
																	</Link>
																</div>
															</div>
														</div>
														
														<div className="flex items-start gap-3">
															<Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
															<div className="flex-1 space-y-0.5">
																<p className="text-xs text-muted-foreground">Email:</p>
																<p className="text-sm font-medium">
																	{followUp.student?.email || "Not provided"}
																</p>
															</div>
														</div>
													</div>

													<div className="space-y-3">
														<div className="flex items-start gap-3">
															<Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
															<div className="flex-1 space-y-0.5">
																<p className="text-xs text-muted-foreground">Phone:</p>
																<p className="text-sm font-medium">
																	{followUp.student?.mobile_phone_number || "Not provided"}
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
									<CardTitle className="text-sm text-muted-foreground">System Information</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
										<div className="space-y-1">
											<p className="text-xs text-muted-foreground">Follow-up ID</p>
											<p className="text-xs font-mono text-muted-foreground">
												{followUp.id}
											</p>
										</div>
										<div className="space-y-1">
											<p className="text-xs text-muted-foreground">Created Date</p>
											<p className="text-sm">
												{format(new Date(followUp.created_at), "MMM d, yyyy")}
											</p>
										</div>
										<div className="space-y-1">
											<p className="text-xs text-muted-foreground">Last Updated</p>
											<p className="text-sm">
												{format(new Date(followUp.updated_at || followUp.created_at), "MMM d, yyyy")}
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