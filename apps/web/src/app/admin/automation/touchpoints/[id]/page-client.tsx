"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

import { EditableSection } from "@/components/inline-edit/EditableSection";
import { InlineEditField } from "@/components/inline-edit/InlineEditField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { format } from "date-fns";
import {
	ArrowDownLeft,
	ArrowUpRight,
	Calendar as CalendarIcon,
	ChevronRight,
	Clock,
	Database,
	Link as LinkIcon,
	Mail,
	MessageSquare,
	MoreVertical,
	Phone,
	Trash2,
	User,
} from "lucide-react";
import { toast } from "sonner";

interface TouchpointDetailsClientProps {
	touchpoint: any;
}

// Channel configuration
const CHANNEL_LABELS = {
	sms: "SMS",
	call: "Call",
	whatsapp: "WhatsApp",
	email: "Email",
};

const CHANNEL_COLORS = {
	sms: "info",
	call: "warning",
	whatsapp: "success",
	email: "default",
};

const CHANNEL_ICONS = {
	sms: Phone,
	call: Phone,
	whatsapp: MessageSquare,
	email: Mail,
};

// Type configuration
const TYPE_LABELS = {
	inbound: "Inbound",
	outbound: "Outbound",
};

const TYPE_COLORS = {
	inbound: "success",
	outbound: "secondary",
};

const TYPE_ICONS = {
	inbound: ArrowDownLeft,
	outbound: ArrowUpRight,
};

// Source configuration
const SOURCE_LABELS = {
	manual: "Manual",
	automated: "Automated",
	openphone: "OpenPhone",
	gmail: "Gmail",
	whatsapp_business: "WhatsApp Business",
	webhook: "Webhook",
};

export default function TouchpointDetailsClient({
	touchpoint: initialTouchpoint,
}: TouchpointDetailsClientProps) {
	const router = useRouter();
	const [touchpoint, setTouchpoint] = useState(initialTouchpoint);
	// Local state for edited values
	const [editedTouchpoint, setEditedTouchpoint] =
		useState<any>(initialTouchpoint);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Update the touchpoint when data changes
	useEffect(() => {
		if (initialTouchpoint) {
			setTouchpoint(initialTouchpoint);
			setEditedTouchpoint(initialTouchpoint);
		}
	}, [initialTouchpoint]);

	// Get channel icon
	const ChannelIcon =
		CHANNEL_ICONS[touchpoint.channel as keyof typeof CHANNEL_ICONS] ||
		MessageSquare;
	const TypeIcon =
		TYPE_ICONS[touchpoint.type as keyof typeof TYPE_ICONS] || ArrowUpRight;

	// Update edited touchpoint field locally
	const updateEditedField = async (field: string, value: any) => {
		setEditedTouchpoint({
			...editedTouchpoint,
			[field]: value,
		});
		// Return a resolved promise to match the expected type
		return Promise.resolve();
	};

	// Save all changes to the API
	const saveAllChanges = async () => {
		try {
			// Collect all changes
			const changes: any = {};

			// Check for changes in fields
			if (editedTouchpoint.channel !== touchpoint.channel) {
				changes.channel = editedTouchpoint.channel;
			}
			if (editedTouchpoint.type !== touchpoint.type) {
				changes.type = editedTouchpoint.type;
			}
			if (editedTouchpoint.source !== touchpoint.source) {
				changes.source = editedTouchpoint.source;
			}
			if (editedTouchpoint.message !== touchpoint.message) {
				changes.message = editedTouchpoint.message;
			}
			if (editedTouchpoint.occurred_at !== touchpoint.occurred_at) {
				changes.occurred_at = editedTouchpoint.occurred_at;
			}

			// If no changes, return early
			if (Object.keys(changes).length === 0) {
				return;
			}

			const response = await fetch(`/api/touchpoints/${touchpoint.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(changes),
			});

			if (!response.ok) throw new Error("Failed to update");

			const updated = await response.json();
			setTouchpoint(updated);
			setEditedTouchpoint(updated);
			toast.success("Changes saved successfully");
		} catch (error) {
			toast.error("Failed to save changes");
			throw error;
		}
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const response = await fetch(`/api/touchpoints/${touchpoint.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete touchpoint");
			}

			toast.success("Touchpoint deleted successfully");
			router.push("/admin/automation/touchpoints");
		} catch (error) {
			console.error("Error deleting touchpoint:", error);
			toast.error("Failed to delete touchpoint");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="min-h-screen bg-muted/30">
			{/* Enhanced Header with Breadcrumb */}
			<div className="border-b bg-background">
				<div className="px-6 py-3">
					<div className="mb-2 flex items-center gap-2 text-muted-foreground text-sm">
						<Link
							href="/admin/automation/touchpoints"
							className="transition-colors hover:text-foreground"
						>
							Touchpoints
						</Link>
						<ChevronRight className="h-3 w-3" />
						<span>Details</span>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
								<ChannelIcon className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h1 className="font-semibold text-xl">Touchpoint Details</h1>
								<div className="mt-0.5 flex items-center gap-2">
									<Badge
										variant={
											CHANNEL_COLORS[
												touchpoint.channel as keyof typeof CHANNEL_COLORS
											] as any
										}
										className="h-4 px-1.5 text-[10px]"
									>
										{
											CHANNEL_LABELS[
												touchpoint.channel as keyof typeof CHANNEL_LABELS
											]
										}
									</Badge>
									<Badge
										variant={
											TYPE_COLORS[
												touchpoint.type as keyof typeof TYPE_COLORS
											] as any
										}
										className="h-4 px-1.5 text-[10px]"
									>
										{TYPE_LABELS[touchpoint.type as keyof typeof TYPE_LABELS]}
									</Badge>
									<Badge variant="outline" className="h-4 px-1.5 text-[10px]">
										{
											SOURCE_LABELS[
												touchpoint.source as keyof typeof SOURCE_LABELS
											]
										}
									</Badge>
								</div>
							</div>
						</div>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm">
									<MoreVertical className="h-3.5 w-3.5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuItem
									className="text-destructive"
									onClick={() => setShowDeleteConfirm(true)}
								>
									<Trash2 className="mr-2 h-3.5 w-3.5" />
									Delete Touchpoint
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

			<div className="space-y-4 px-6 py-4">
				{/* Touchpoint Information with inline editing */}
				<EditableSection
					title="Touchpoint Information"
					onEditStart={() => setEditedTouchpoint(touchpoint)}
					onSave={saveAllChanges}
					onCancel={() => setEditedTouchpoint(touchpoint)}
				>
					{(editing) => (
						<div className="grid gap-8 lg:grid-cols-3">
							{/* Communication Details */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Communication
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<MessageSquare className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Channel:</p>
											{editing ? (
												<InlineEditField
													value={editedTouchpoint.channel}
													onSave={(value) =>
														updateEditedField("channel", value)
													}
													editing={editing}
													type="select"
													options={Object.entries(CHANNEL_LABELS).map(
														([value, label]) => ({
															value,
															label,
														}),
													)}
												/>
											) : (
												<Badge
													variant={
														CHANNEL_COLORS[
															touchpoint.channel as keyof typeof CHANNEL_COLORS
														] as any
													}
												>
													{
														CHANNEL_LABELS[
															touchpoint.channel as keyof typeof CHANNEL_LABELS
														]
													}
												</Badge>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<TypeIcon className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Direction:
											</p>
											{editing ? (
												<InlineEditField
													value={editedTouchpoint.type}
													onSave={(value) => updateEditedField("type", value)}
													editing={editing}
													type="select"
													options={Object.entries(TYPE_LABELS).map(
														([value, label]) => ({
															value,
															label,
														}),
													)}
												/>
											) : (
												<Badge
													variant={
														TYPE_COLORS[
															touchpoint.type as keyof typeof TYPE_COLORS
														] as any
													}
												>
													{
														TYPE_LABELS[
															touchpoint.type as keyof typeof TYPE_LABELS
														]
													}
												</Badge>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Database className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Source:</p>
											{editing ? (
												<InlineEditField
													value={editedTouchpoint.source}
													onSave={(value) => updateEditedField("source", value)}
													editing={editing}
													type="select"
													options={Object.entries(SOURCE_LABELS).map(
														([value, label]) => ({
															value,
															label,
														}),
													)}
												/>
											) : (
												<Badge variant="outline">
													{
														SOURCE_LABELS[
															touchpoint.source as keyof typeof SOURCE_LABELS
														]
													}
												</Badge>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<CalendarIcon className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Date & Time:
											</p>
											{editing ? (
												<div className="flex gap-2">
													<Popover>
														<PopoverTrigger asChild>
															<Button
																variant="outline"
																size="sm"
																className={cn(
																	"flex-1 justify-start text-left font-normal",
																	!editedTouchpoint.occurred_at &&
																		"text-muted-foreground",
																)}
															>
																<CalendarIcon className="mr-2 h-3 w-3" />
																{editedTouchpoint.occurred_at ? (
																	format(
																		new Date(editedTouchpoint.occurred_at),
																		"MMM d, yyyy",
																	)
																) : (
																	<span>Pick a date</span>
																)}
															</Button>
														</PopoverTrigger>
														<PopoverContent
															className="w-auto p-0"
															align="start"
														>
															<Calendar
																mode="single"
																selected={
																	new Date(editedTouchpoint.occurred_at)
																}
																onSelect={(date) => {
																	if (date) {
																		// Preserve the time from the current value
																		const currentTime = new Date(
																			editedTouchpoint.occurred_at,
																		);
																		date.setHours(
																			currentTime.getHours(),
																			currentTime.getMinutes(),
																			currentTime.getSeconds(),
																			currentTime.getMilliseconds(),
																		);
																		// Send timezone-safe ISO timestamp
																		updateEditedField(
																			"occurred_at",
																			date.toISOString(),
																		);
																	}
																}}
																initialFocus
															/>
														</PopoverContent>
													</Popover>
													<input
														type="time"
														className="h-8 rounded-md border border-input bg-background px-2 text-sm"
														value={(() => {
															const date = new Date(
																editedTouchpoint.occurred_at,
															);
															const hours = date
																.getHours()
																.toString()
																.padStart(2, "0");
															const minutes = date
																.getMinutes()
																.toString()
																.padStart(2, "0");
															return `${hours}:${minutes}`;
														})()}
														onChange={(e) => {
															const [hours, minutes] =
																e.target.value.split(":");
															const newDate = new Date(
																editedTouchpoint.occurred_at,
															);
															newDate.setHours(
																Number.parseInt(hours, 10),
																Number.parseInt(minutes, 10),
																newDate.getSeconds(),
																newDate.getMilliseconds(),
															);
															// Send timezone-safe ISO timestamp
															updateEditedField(
																"occurred_at",
																newDate.toISOString(),
															);
														}}
													/>
												</div>
											) : (
												<span className="text-sm">
													{format(
														new Date(touchpoint.occurred_at),
														"MMM d, yyyy 'at' h:mm a",
													)}
												</span>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Message Content */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Message
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Content:</p>
											<InlineEditField
												value={editedTouchpoint.message}
												onSave={(value) => updateEditedField("message", value)}
												editing={editing}
												type="textarea"
											/>
										</div>
									</div>
								</div>
							</div>

							{/* Student Information */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Student
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<User className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Name:</p>
											<Link
												href={`/admin/students/${touchpoint.student_id}`}
												className="text-primary text-sm hover:underline"
											>
												{touchpoint.students?.full_name || "Unknown Student"}
											</Link>
										</div>
									</div>

									{touchpoint.students?.email && (
										<div className="flex items-start gap-3">
											<Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
											<div className="flex-1 space-y-0.5">
												<p className="text-muted-foreground text-xs">Email:</p>
												<p className="text-sm">{touchpoint.students.email}</p>
											</div>
										</div>
									)}

									{touchpoint.students?.mobile_phone_number && (
										<div className="flex items-start gap-3">
											<Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
											<div className="flex-1 space-y-0.5">
												<p className="text-muted-foreground text-xs">Phone:</p>
												<p className="text-sm">
													{touchpoint.students.mobile_phone_number}
												</p>
											</div>
										</div>
									)}

									{/* Follow-up Link */}
									{touchpoint.automated_follow_up_id && (
										<div className="flex items-start gap-3">
											<LinkIcon className="mt-0.5 h-4 w-4 text-muted-foreground" />
											<div className="flex-1 space-y-0.5">
												<p className="text-muted-foreground text-xs">
													Follow-up:
												</p>
												<Link
													href={`/admin/automation/automated-follow-ups/${touchpoint.automated_follow_up_id}`}
													className="text-primary text-sm hover:underline"
												>
													{touchpoint.automated_follow_ups
														?.template_follow_up_sequences?.display_name ||
														"View Sequence"}
												</Link>
												{touchpoint.automated_follow_ups?.status && (
													<Badge
														variant="success"
														className="ml-2 h-4 px-1.5 text-[10px]"
													>
														{touchpoint.automated_follow_ups.status}
													</Badge>
												)}
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					)}
				</EditableSection>

				{/* System Information - Less prominent at the bottom */}
				<div className="mt-8 border-t pt-6">
					<div className="mx-auto max-w-3xl">
						<div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground/70 text-xs">
							<div className="flex items-center gap-2">
								<span>ID:</span>
								<code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono">
									{touchpoint.id.slice(0, 8)}
								</code>
							</div>
							{touchpoint.student_id && (
								<div className="flex items-center gap-2">
									<span>Student:</span>
									<code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono">
										{touchpoint.student_id.slice(0, 8)}
									</code>
								</div>
							)}
							<div className="flex items-center gap-2">
								<Clock className="h-3 w-3" />
								<span>Created at:</span>
								<span>
									{format(
										new Date(touchpoint.created_at),
										"MMM d, yyyy 'at' h:mm a",
									)}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="h-3 w-3" />
								<span>Updated at:</span>
								<span>
									{format(
										new Date(touchpoint.updated_at),
										"MMM d, yyyy 'at' h:mm a",
									)}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<DeleteConfirmationDialog
				open={showDeleteConfirm}
				onOpenChange={setShowDeleteConfirm}
				onConfirm={handleDelete}
				title="Delete Touchpoint"
				description="Are you sure you want to delete this touchpoint?"
				isDeleting={isDeleting}
			/>
		</div>
	);
}
