"use client";

import React, { useEffect, useState } from "react";

import { EditableSection } from "@/components/inline-edit/EditableSection";
import { InlineEditField } from "@/components/inline-edit/InlineEditField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { format } from "date-fns";
import {
	Calendar,
	CheckCircle2,
	Clock,
	Edit2,
	ExternalLink,
	FolderOpen,
	Save,
	Users,
	Video,
} from "lucide-react";
import { toast } from "sonner";

interface ClassDetails {
	id: string;
	cohort_id: string;
	start_time: string;
	end_time: string;
	status: "scheduled" | "in_progress" | "completed" | "cancelled";
	meeting_link?: string;
	notes?: string;
	attendance_count?: number;
	google_drive_folder_id?: string;
	teacher_id?: string;
	teacher?: {
		id: string;
		first_name: string;
		last_name: string;
	};
	cohort?: {
		id: string;
		format: "online" | "in-person" | "hybrid";
		room?: string;
	};
}

interface ClassDetailsModalProps {
	open: boolean;
	onClose: () => void;
	classItem: ClassDetails | null;
	onUpdate: (classItem: ClassDetails) => void;
}

export function ClassDetailsModal({
	open,
	onClose,
	classItem,
	onUpdate,
}: ClassDetailsModalProps) {
	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [formData, setFormData] = useState<Partial<ClassDetails>>({});

	// Initialize form data when class changes
	useEffect(() => {
		if (classItem) {
			setFormData({
				status: classItem.status,
				meeting_link: classItem.meeting_link || "",
				notes: classItem.notes || "",
				google_drive_folder_id: classItem.google_drive_folder_id || "",
			});
		}
	}, [classItem]);

	// Reset editing state when modal closes
	useEffect(() => {
		if (!open) {
			setEditing(false);
		}
	}, [open]);

	const updateField = async (field: string, value: any) => {
		if (!classItem) return;

		setSaving(true);
		try {
			const response = await fetch(`/api/classes/${classItem.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ [field]: value || null }),
			});

			if (!response.ok) throw new Error("Failed to update class");

			const updated = await response.json();
			onUpdate(updated);
			setFormData({ ...formData, [field]: value });
			toast.success("Class updated successfully");
		} catch (error) {
			console.error("Error updating class:", error);
			toast.error("Failed to update class");
			throw error;
		} finally {
			setSaving(false);
		}
	};

	const handleClose = () => {
		setEditing(false);
		setFormData({});
		onClose();
	};

	if (!classItem) return null;

	const classDate = new Date(classItem.start_time);
	const startTime = new Date(classItem.start_time);
	const endTime = new Date(classItem.end_time);

	// Generate a display name for the class based on its date
	const displayName = `Class - ${format(classDate, "EEEE, MMM d")}`;

	const statusColors = {
		scheduled: "bg-blue-500/10 text-blue-700 border-blue-200",
		in_progress: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
		completed: "bg-green-500/10 text-green-700 border-green-200",
		cancelled: "bg-red-500/10 text-red-700 border-red-200",
	};
	const statusColor =
		statusColors[classItem.status] ||
		"bg-gray-500/10 text-gray-700 border-gray-200";

	// Calculate duration
	const duration = (() => {
		const start = classItem.start_time.split("T")[1]?.split(":");
		const end = classItem.end_time.split("T")[1]?.split(":");
		if (start && end) {
			const startMinutes =
				Number.parseInt(start[0]) * 60 + Number.parseInt(start[1]);
			const endMinutes = Number.parseInt(end[0]) * 60 + Number.parseInt(end[1]);
			const diff = endMinutes - startMinutes;
			const hours = Math.floor(diff / 60);
			const minutes = diff % 60;
			return hours > 0
				? `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`
				: `${minutes}m`;
		}
		return "";
	})();

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<div className="flex items-center justify-between">
						<div>
							<DialogTitle>Class Details</DialogTitle>
							<DialogDescription>
								View and edit class information
							</DialogDescription>
						</div>
						<Button
							variant={editing ? "default" : "outline"}
							size="sm"
							onClick={() => setEditing(!editing)}
						>
							{editing ? (
								<>
									<CheckCircle2 className="mr-2 h-4 w-4" />
									Done Editing
								</>
							) : (
								<>
									<Edit2 className="mr-2 h-4 w-4" />
									Edit Details
								</>
							)}
						</Button>
					</div>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Class Header */}
					<div className="space-y-3 rounded-lg bg-muted/30 p-4">
						<div className="flex items-start gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
								<Calendar className="h-5 w-5 text-primary" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-lg">{displayName}</h3>
								<div className="mt-1 flex items-center gap-3 text-muted-foreground text-sm">
									<div className="flex items-center gap-1">
										<Calendar className="h-3 w-3" />
										<span>{format(classDate, "EEEE, MMM d, yyyy")}</span>
									</div>
									<div className="flex items-center gap-1">
										<Clock className="h-3 w-3" />
										<span>
											{format(startTime, "h:mm a")} -{" "}
											{format(endTime, "h:mm a")}
										</span>
									</div>
									{duration && (
										<Badge variant="secondary" className="text-xs">
											{duration}
										</Badge>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Status */}
					<div className="space-y-2">
						<Label>Status</Label>
						{editing ? (
							<Select
								value={formData.status || classItem.status}
								onValueChange={(value) => updateField("status", value)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="scheduled">Scheduled</SelectItem>
									<SelectItem value="in_progress">In Progress</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
									<SelectItem value="cancelled">Cancelled</SelectItem>
								</SelectContent>
							</Select>
						) : (
							<Badge variant="outline" className={`${statusColor}`}>
								{classItem.status
									?.replace(/_/g, " ")
									.replace(/\b\w/g, (l) => l.toUpperCase())}
							</Badge>
						)}
					</div>

					{/* Teacher */}
					{classItem.teacher && (
						<div className="space-y-2">
							<Label>Teacher</Label>
							<div className="flex items-center gap-2">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
									<Users className="h-4 w-4 text-primary" />
								</div>
								<span className="text-sm">
									{classItem.teacher.first_name} {classItem.teacher.last_name}
								</span>
							</div>
						</div>
					)}

					{/* Meeting Link */}
					<div className="space-y-2">
						<Label>Meeting Link</Label>
						{editing ? (
							<Input
								value={formData.meeting_link || ""}
								onChange={(e) =>
									setFormData({ ...formData, meeting_link: e.target.value })
								}
								onBlur={() =>
									updateField("meeting_link", formData.meeting_link)
								}
								placeholder="https://..."
								type="url"
							/>
						) : classItem.meeting_link ? (
							<a
								href={classItem.meeting_link}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 text-primary text-sm hover:underline"
							>
								<Video className="h-4 w-4" />
								<span>Join Meeting</span>
								<ExternalLink className="h-3 w-3" />
							</a>
						) : (
							<span className="text-muted-foreground text-sm">
								No meeting link
							</span>
						)}
					</div>

					{/* Notes */}
					<div className="space-y-2">
						<Label>Notes</Label>
						{editing ? (
							<Textarea
								value={formData.notes || ""}
								onChange={(e) =>
									setFormData({ ...formData, notes: e.target.value })
								}
								onBlur={() => updateField("notes", formData.notes)}
								placeholder="Add class notes..."
								rows={3}
							/>
						) : classItem.notes ? (
							<p className="text-muted-foreground text-sm">{classItem.notes}</p>
						) : (
							<span className="text-muted-foreground text-sm">No notes</span>
						)}
					</div>

				

					{/* Google Drive */}
					<div className="space-y-2">
						<Label>Google Drive Folder</Label>
						{editing ? (
							<div className="space-y-2">
								<Input
									value={formData.google_drive_folder_id || ""}
									onChange={(e) =>
										setFormData({
											...formData,
											google_drive_folder_id: e.target.value,
										})
									}
									onBlur={() =>
										updateField(
											"google_drive_folder_id",
											formData.google_drive_folder_id,
										)
									}
									placeholder="Google Drive folder ID"
								/>
								<p className="text-muted-foreground text-xs">
									Enter the folder ID from the Google Drive URL (the part after
									/folders/)
								</p>
							</div>
						) : classItem.google_drive_folder_id ? (
							<a
								href={`https://drive.google.com/drive/folders/${classItem.google_drive_folder_id}`}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 text-primary text-sm hover:underline"
							>
								<FolderOpen className="h-4 w-4" />
								<span>Open Google Drive Folder</span>
								<ExternalLink className="h-3 w-3" />
							</a>
						) : (
							<span className="text-muted-foreground text-sm">
								No folder linked
							</span>
						)}
					</div>

					{/* System Info */}
					<div className="space-y-1 border-t pt-2 text-muted-foreground text-xs">
						<div>Class ID: {classItem.id.slice(0, 8)}</div>
						<div>Cohort ID: {classItem.cohort_id.slice(0, 8)}</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
