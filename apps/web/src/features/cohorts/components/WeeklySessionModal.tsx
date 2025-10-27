"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface WeeklySessionModalProps {
	open: boolean;
	onClose: () => void;
	cohortId: string;
	sessionToEdit?: any; // Session data when editing
	canEdit?: boolean; // Permission to edit/delete sessions
}

// Days of week
const daysOfWeek = [
	{ value: "monday", label: "Monday" },
	{ value: "tuesday", label: "Tuesday" },
	{ value: "wednesday", label: "Wednesday" },
	{ value: "thursday", label: "Thursday" },
	{ value: "friday", label: "Friday" },
	{ value: "saturday", label: "Saturday" },
	{ value: "sunday", label: "Sunday" },
];

export function WeeklySessionModal({
	open,
	onClose,
	cohortId,
	sessionToEdit,
	canEdit = true,
}: WeeklySessionModalProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [formData, setFormData] = useState({
		teacher_id: "",
		day_of_week: "",
		start_time: "",
		end_time: "",
	});

	const isEditMode = !!sessionToEdit;

	// Initialize form with session data when editing
	useEffect(() => {
		if (sessionToEdit) {
			setFormData({
				teacher_id: sessionToEdit.teacher_id || "",
				day_of_week: sessionToEdit.day_of_week || "",
				start_time: sessionToEdit.start_time
					? sessionToEdit.start_time.substring(0, 5)
					: "",
				end_time: sessionToEdit.end_time
					? sessionToEdit.end_time.substring(0, 5)
					: "",
			});
		} else {
			// Reset form when creating new
			setFormData({
				teacher_id: "",
				day_of_week: "",
				start_time: "",
				end_time: "",
			});
		}
	}, [sessionToEdit]);

	// Fetch teachers for the select dropdown
	const { data: teachers, isLoading: loadingTeachers } = useQuery({
		queryKey: ["teachers"],
		queryFn: async () => {
			const response = await fetch("/api/teachers?limit=100");
			if (!response.ok) throw new Error("Failed to fetch teachers");
			const data = await response.json();
			return data.data || [];
		},
		enabled: open, // Only fetch when modal is open
	});

	// Create session mutation
	const createSessionMutation = useMutation({
		mutationFn: async (data: typeof formData) => {
			const response = await fetch(`/api/cohorts/${cohortId}/sessions`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create session");
			}

			return response.json();
		},
		onSuccess: () => {
			toast.success("Weekly session created successfully");
			// Invalidate queries to refresh the data
			queryClient.invalidateQueries({
				queryKey: ["cohorts", "detail", cohortId, "sessions"],
			});
			queryClient.invalidateQueries({
				queryKey: ["cohorts", "detail", cohortId],
			});
			handleClose();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create weekly session");
		},
	});

	// Update session mutation
	const updateSessionMutation = useMutation({
		mutationFn: async (data: typeof formData) => {
			const response = await fetch(`/api/weekly-sessions/${sessionToEdit.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update session");
			}

			return response.json();
		},
		onSuccess: () => {
			toast.success("Weekly session updated successfully");
			queryClient.invalidateQueries({
				queryKey: ["cohorts", "detail", cohortId, "sessions"],
			});
			queryClient.invalidateQueries({
				queryKey: ["cohorts", "detail", cohortId],
			});
			handleClose();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update weekly session");
		},
	});

	// Delete session mutation
	const deleteSessionMutation = useMutation({
		mutationFn: async () => {
			const response = await fetch(`/api/weekly-sessions/${sessionToEdit.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete session");
			}

			return response.json();
		},
		onSuccess: () => {
			toast.success("Weekly session deleted successfully");
			queryClient.invalidateQueries({
				queryKey: ["cohorts", "detail", cohortId, "sessions"],
			});
			queryClient.invalidateQueries({
				queryKey: ["cohorts", "detail", cohortId],
			});
			setShowDeleteConfirm(false);
			handleClose();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete weekly session");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validate form
		if (
			!formData.teacher_id ||
			!formData.day_of_week ||
			!formData.start_time ||
			!formData.end_time
		) {
			toast.error("Please fill in all required fields");
			return;
		}

		// Validate time
		if (formData.start_time >= formData.end_time) {
			toast.error("End time must be after start time");
			return;
		}

		if (isEditMode) {
			updateSessionMutation.mutate(formData);
		} else {
			createSessionMutation.mutate(formData);
		}
	};

	const handleClose = () => {
		// Reset form
		setFormData({
			teacher_id: "",
			day_of_week: "",
			start_time: "",
			end_time: "",
		});
		onClose();
	};

	const handleInputChange = (field: keyof typeof formData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<>
			<Dialog open={open} onOpenChange={handleClose}>
				<DialogContent className="sm:max-w-[500px]">
					<form onSubmit={handleSubmit}>
						<DialogHeader>
							<DialogTitle>
								{isEditMode ? "Edit Weekly Session" : "Add Weekly Session"}
							</DialogTitle>
							<DialogDescription>
								{isEditMode
									? "Update the details of this weekly session."
									: "Schedule a recurring weekly session for this cohort."}
							</DialogDescription>
						</DialogHeader>

						<div className="grid gap-4 py-4">
							{/* Teacher Selection */}
							<div className="grid gap-2">
								<Label htmlFor="teacher">Teacher *</Label>
								<Select
									value={formData.teacher_id}
									onValueChange={(value) =>
										handleInputChange("teacher_id", value)
									}
									disabled={loadingTeachers}
								>
									<SelectTrigger id="teacher">
										<SelectValue
											placeholder={
												loadingTeachers
													? "Loading teachers..."
													: "Select a teacher"
											}
										/>
									</SelectTrigger>
									<SelectContent>
										{teachers?.map((teacher: any) => (
											<SelectItem key={teacher.id} value={teacher.id}>
												{teacher.first_name} {teacher.last_name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Day of Week */}
							<div className="grid gap-2">
								<Label htmlFor="day">Day of Week *</Label>
								<Select
									value={formData.day_of_week}
									onValueChange={(value) =>
										handleInputChange("day_of_week", value)
									}
								>
									<SelectTrigger id="day">
										<SelectValue placeholder="Select a day" />
									</SelectTrigger>
									<SelectContent>
										{daysOfWeek.map((day) => (
											<SelectItem key={day.value} value={day.value}>
												{day.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Time Selection */}
							<div className="grid grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label htmlFor="start_time">Start Time *</Label>
									<Input
										id="start_time"
										type="time"
										value={formData.start_time}
										onChange={(e) =>
											handleInputChange("start_time", e.target.value)
										}
										required
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="end_time">End Time *</Label>
									<Input
										id="end_time"
										type="time"
										value={formData.end_time}
										onChange={(e) =>
											handleInputChange("end_time", e.target.value)
										}
										required
									/>
								</div>
							</div>
						</div>

						<DialogFooter className="flex justify-between">
							{isEditMode && (
								<Button
									type="button"
									variant="destructive"
									onClick={() => setShowDeleteConfirm(true)}
									disabled={deleteSessionMutation.isPending}
									className="mr-auto"
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Delete
								</Button>
							)}
							<div className="ml-auto flex gap-2">
								<Button type="button" variant="outline" onClick={handleClose}>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={
										isEditMode
											? updateSessionMutation.isPending
											: createSessionMutation.isPending
									}
								>
									{(isEditMode
										? updateSessionMutation.isPending
										: createSessionMutation.isPending) && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									{isEditMode ? "Update Session" : "Create Session"}
								</Button>
							</div>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Weekly Session</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this weekly session? This action
							cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => deleteSessionMutation.mutate()}
							disabled={deleteSessionMutation.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteSessionMutation.isPending && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
