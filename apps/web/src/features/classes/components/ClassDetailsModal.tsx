"use client";

import { useEffect, useState } from "react";

import { SearchableSelect } from "@/components/form-layout/SearchableSelect";
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

import { cohortsKeys } from "@/features/cohorts/queries/cohorts.queries";
import { languageLevelQueries } from "@/features/language-levels/queries/language-levels.queries";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	AlertCircle,
	Calendar,
	CheckCircle2,
	Clock,
	Edit2,
	ExternalLink,
	GraduationCap,
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
		current_level_id?: string;
		current_level?: {
			id: string;
			display_name: string;
		};
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
	const [formData, setFormData] = useState<
		Partial<ClassDetails> & { current_level_id?: string }
	>({});

	const queryClient = useQueryClient();

	// Fetch language levels
	const { data: languageLevels, isLoading: languageLevelsLoading } = useQuery(
		languageLevelQueries.list(),
	);

	// Initialize form data when class changes or when modal opens
	useEffect(() => {
		if (classItem && open) {
			setFormData({
				status: classItem.status,
				meeting_link: classItem.meeting_link || "",
				notes: classItem.notes || "",
				current_level_id: classItem.cohort?.current_level_id || "",
			});
		}
	}, [classItem, open]);

	// Auto-populate current_level_id when status is "completed" and editing mode is active
	useEffect(() => {
		if (editing && formData.status === "completed" && classItem?.cohort?.current_level_id) {
			// Always sync with cohort's current level when entering edit mode for completed classes
			if (!formData.current_level_id) {
				setFormData((prev) => ({
					...prev,
					current_level_id: classItem.cohort?.current_level_id || "",
				}));
			}
		}
	}, [editing, formData.status, formData.current_level_id, classItem?.cohort?.current_level_id]);

	// Reset editing state when modal closes
	useEffect(() => {
		if (!open) {
			setEditing(false);
		}
	}, [open]);

	const saveChanges = async () => {
		if (!classItem) return;

		setSaving(true);
		try {
			// Update class details
			const response = await fetch(`/api/classes/${classItem.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					status: formData.status || null,
					meeting_link: formData.meeting_link || null,
					notes: formData.notes || null,
				}),
			});

			if (!response.ok) throw new Error("Failed to update class");

			const updated = await response.json();

			// Update cohort current level if status is completed and level changed
			if (
				formData.status === "completed" &&
				formData.current_level_id &&
				formData.current_level_id !== classItem.cohort?.current_level_id
			) {
				const cohortResponse = await fetch(
					`/api/cohorts/${classItem.cohort_id}`,
					{
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							current_level_id: formData.current_level_id,
						}),
					},
				);

				if (!cohortResponse.ok) {
					throw new Error("Failed to update cohort level");
				}

				// Invalidate cohort queries to refresh data immediately
				await Promise.all([
					queryClient.invalidateQueries({
						queryKey: cohortsKeys.detail(classItem.cohort_id),
					}),
					queryClient.invalidateQueries({
						queryKey: cohortsKeys.all,
					}),
					// Also invalidate classes list to update the cohort level displayed with classes
					queryClient.invalidateQueries({
						queryKey: ["cohorts", classItem.cohort_id, "classes"],
					}),
				]);

				// Build nextCohort with updated level information
				const selectedLevel = languageLevels?.find(
					(level) => level.id === formData.current_level_id,
				);

				const nextCohort = {
					...classItem.cohort,
					current_level_id: formData.current_level_id,
					current_level: selectedLevel
						? {
								id: selectedLevel.id,
								display_name: selectedLevel.display_name,
							}
						: undefined,
				};

				// Call onUpdate with the refreshed cohort level
				onUpdate({ ...updated, cohort: nextCohort });
			} else {
				onUpdate(updated);
			}
			toast.success("Class updated successfully");
			setEditing(false);
		} catch (error) {
			console.error("Error updating class:", error);
			toast.error("Failed to update class");
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
					<DialogTitle>Class Details</DialogTitle>
					<DialogDescription>
						View and edit class information
					</DialogDescription>
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
								onValueChange={(value) =>
									setFormData({ ...formData, status: value as any })
								}
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

					{/* Current Level - Only show in edit mode when status is completed */}
					{editing && formData.status === "completed" ? (
						<div className="space-y-2">
							<Label>Current Level</Label>
							<p className="text-muted-foreground text-xs">
								Update the cohort's current level to accurately track student
								progress after completing this class
							</p>
							<SearchableSelect
								placeholder={
									languageLevelsLoading
										? "Loading levels..."
										: "Select current level"
								}
								searchPlaceholder="Type to search levels..."
								value={formData.current_level_id || ""}
								onValueChange={(value) =>
									setFormData((prev) => ({ ...prev, current_level_id: value }))
								}
								options={
									languageLevels?.map((level) => ({
										label: level.display_name,
										value: level.id,
									})) || []
								}
								showOnlyOnSearch={true}
								disabled={languageLevelsLoading}
							/>
						</div>
					) : null}

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

					{/* Internal Notes */}
					<div className="space-y-2">
						<Label>Internal Notes</Label>
						{editing ? (
							<Textarea
								value={formData.notes || ""}
								onChange={(e) =>
									setFormData({ ...formData, notes: e.target.value })
								}
								placeholder="Add internal notes..."
								rows={3}
							/>
						) : classItem.notes ? (
							<p className="text-muted-foreground text-sm">{classItem.notes}</p>
						) : (
							<span className="text-muted-foreground text-sm">
								No internal notes
							</span>
						)}
					</div>

					{/* System Info */}
					<div className="space-y-1 border-t pt-2 text-muted-foreground text-xs">
						<div>Class ID: {classItem.id.slice(0, 8)}</div>
						<div>Cohort ID: {classItem.cohort_id.slice(0, 8)}</div>
					</div>
				</div>

				<DialogFooter className="flex items-center justify-between gap-3 sm:justify-between">
					<Button
						variant="outline"
						onClick={handleClose}
						disabled={saving}
						className="order-1"
					>
						Close
					</Button>
					{editing ? (
						<Button
							onClick={saveChanges}
							disabled={saving}
							className="order-2"
						>
							{saving ? (
								<>Saving...</>
							) : (
								<>
									<CheckCircle2 className="mr-2 h-4 w-4" />
									Done Editing
								</>
							)}
						</Button>
					) : (
						<Button
							variant="outline"
							onClick={() => setEditing(true)}
							className="order-2"
						>
							<Edit2 className="mr-2 h-4 w-4" />
							Edit Details
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
