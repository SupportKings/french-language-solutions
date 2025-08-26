"use client";

import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { EditableSection } from "@/components/inline-edit/EditableSection";
import { InlineEditField } from "@/components/inline-edit/InlineEditField";
import { 
	Calendar, 
	Clock, 
	MapPin, 
	Users, 
	Video, 
	FolderOpen,
	Save,
	Edit2,
	CheckCircle2,
	ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface ClassDetails {
	id: string;
	name?: string; // Optional - only if exists in DB
	cohort_id: string;
	start_time: string;
	end_time: string;
	status: "scheduled" | "in_progress" | "completed" | "cancelled";
	room?: string;
	meeting_link?: string;
	notes?: string;
	current_enrollment?: number;
	google_drive_folder_id?: string;
	teacher_id?: string;
	teachers?: {
		id: string;
		first_name: string;
		last_name: string;
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
				room: classItem.room || "",
				meeting_link: classItem.meeting_link || "",
				notes: classItem.notes || "",
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
	
	// Generate a display name if class doesn't have a name
	const displayName = classItem.name || `Class - ${format(classDate, "EEEE, MMM d")}`;

	const statusColors = {
		scheduled: "bg-blue-500/10 text-blue-700 border-blue-200",
		in_progress: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
		completed: "bg-green-500/10 text-green-700 border-green-200",
		cancelled: "bg-red-500/10 text-red-700 border-red-200",
	};
	const statusColor = statusColors[classItem.status] || "bg-gray-500/10 text-gray-700 border-gray-200";

	// Calculate duration
	const duration = (() => {
		const start = classItem.start_time.split("T")[1]?.split(":");
		const end = classItem.end_time.split("T")[1]?.split(":");
		if (start && end) {
			const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
			const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
			const diff = endMinutes - startMinutes;
			const hours = Math.floor(diff / 60);
			const minutes = diff % 60;
			return hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}` : `${minutes}m`;
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
									<CheckCircle2 className="h-4 w-4 mr-2" />
									Done Editing
								</>
							) : (
								<>
									<Edit2 className="h-4 w-4 mr-2" />
									Edit Details
								</>
							)}
						</Button>
					</div>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Class Header */}
					<div className="rounded-lg bg-muted/30 p-4 space-y-3">
						<div className="flex items-start gap-3">
							<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
								<Calendar className="h-5 w-5 text-primary" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-lg">{displayName}</h3>
								<div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
									<div className="flex items-center gap-1">
										<Calendar className="h-3 w-3" />
										<span>{format(classDate, "EEEE, MMM d, yyyy")}</span>
									</div>
									<div className="flex items-center gap-1">
										<Clock className="h-3 w-3" />
										<span>
											{format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
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
								{classItem.status?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
							</Badge>
						)}
					</div>

					{/* Teacher */}
					{classItem.teachers && (
						<div className="space-y-2">
							<Label>Teacher</Label>
							<div className="flex items-center gap-2">
								<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
									<Users className="h-4 w-4 text-primary" />
								</div>
								<span className="text-sm">
									{classItem.teachers.first_name} {classItem.teachers.last_name}
								</span>
							</div>
						</div>
					)}

					{/* Location */}
					<div className="space-y-2">
						<Label>Room/Location</Label>
						{editing ? (
							<Input
								value={formData.room || ""}
								onChange={(e) => setFormData({ ...formData, room: e.target.value })}
								onBlur={() => updateField("room", formData.room)}
								placeholder="Enter room or location"
							/>
						) : classItem.room ? (
							<div className="flex items-center gap-2 text-sm">
								<MapPin className="h-4 w-4 text-muted-foreground" />
								<span>{classItem.room}</span>
							</div>
						) : (
							<span className="text-sm text-muted-foreground">Not specified</span>
						)}
					</div>

					{/* Meeting Link */}
					<div className="space-y-2">
						<Label>Meeting Link</Label>
						{editing ? (
							<Input
								value={formData.meeting_link || ""}
								onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
								onBlur={() => updateField("meeting_link", formData.meeting_link)}
								placeholder="https://..."
								type="url"
							/>
						) : classItem.meeting_link ? (
							<a
								href={classItem.meeting_link}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 text-sm text-primary hover:underline"
							>
								<Video className="h-4 w-4" />
								<span>Join Meeting</span>
								<ExternalLink className="h-3 w-3" />
							</a>
						) : (
							<span className="text-sm text-muted-foreground">No meeting link</span>
						)}
					</div>

					{/* Notes */}
					<div className="space-y-2">
						<Label>Notes</Label>
						{editing ? (
							<Textarea
								value={formData.notes || ""}
								onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
								onBlur={() => updateField("notes", formData.notes)}
								placeholder="Add class notes..."
								rows={3}
							/>
						) : classItem.notes ? (
							<p className="text-sm text-muted-foreground">{classItem.notes}</p>
						) : (
							<span className="text-sm text-muted-foreground">No notes</span>
						)}
					</div>

					{/* Enrollment Info */}
					{classItem.current_enrollment !== undefined && (
						<div className="space-y-2">
							<Label>Attendance</Label>
							<div className="flex items-center gap-2 text-sm">
								<Users className="h-4 w-4 text-muted-foreground" />
								<span>{classItem.current_enrollment} students attending</span>
							</div>
						</div>
					)}

					{/* Google Drive */}
					{classItem.google_drive_folder_id && (
						<div className="space-y-2">
							<Label>Resources</Label>
							<a
								href={`https://drive.google.com/drive/folders/${classItem.google_drive_folder_id}`}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
							>
								<FolderOpen className="h-4 w-4" />
								<span>Open Google Drive Folder</span>
								<ExternalLink className="h-3 w-3" />
							</a>
						</div>
					)}

					{/* System Info */}
					<div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
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