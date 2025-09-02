"use client";

import { useEffect, useState } from "react";

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
import { Calendar, Clock, Link, Users, Save, X } from "lucide-react";
import { toast } from "sonner";

interface Teacher {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
}

interface ClassCreateModalProps {
	open: boolean;
	onClose: () => void;
	cohortId: string;
	onSuccess?: (newClass: any) => void;
}

export function ClassCreateModal({
	open,
	onClose,
	cohortId,
	onSuccess,
}: ClassCreateModalProps) {
	const [loading, setLoading] = useState(false);
	const [teachers, setTeachers] = useState<Teacher[]>([]);
	const [loadingTeachers, setLoadingTeachers] = useState(false);
	
	// Form state
	const [formData, setFormData] = useState({
		cohort_id: cohortId,
		teacher_id: "",
		start_time: "",
		end_time: "",
		status: "scheduled",
		meeting_link: "",
		notes: "",
	});

	// Fetch teachers when modal opens
	useEffect(() => {
		if (open) {
			fetchTeachers();
			// Reset form when modal opens
			setFormData({
				cohort_id: cohortId,
				teacher_id: "",
				start_time: "",
				end_time: "",
				status: "scheduled",
				meeting_link: "",
				notes: "",
			});
		}
	}, [open, cohortId]);

	const fetchTeachers = async () => {
		setLoadingTeachers(true);
		try {
			const response = await fetch("/api/teachers");
			if (response.ok) {
				const result = await response.json();
				setTeachers(result.data || []);
			}
		} catch (error) {
			console.error("Error fetching teachers:", error);
			toast.error("Failed to load teachers");
		} finally {
			setLoadingTeachers(false);
		}
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData(prev => ({
			...prev,
			[field]: value,
		}));

		// Auto-calculate end time when start time is set (default 1.5 hours)
		if (field === "start_time" && value && !formData.end_time) {
			const startDate = new Date(value);
			const endDate = new Date(startDate.getTime() + 90 * 60000); // Add 90 minutes
			const endTimeString = endDate.toISOString().slice(0, 16);
			setFormData(prev => ({
				...prev,
				end_time: endTimeString,
			}));
		}
	};

	const validateForm = () => {
		if (!formData.start_time) {
			toast.error("Please select a start date and time");
			return false;
		}
		if (!formData.end_time) {
			toast.error("Please select an end date and time");
			return false;
		}
		if (new Date(formData.end_time) <= new Date(formData.start_time)) {
			toast.error("End time must be after start time");
			return false;
		}
		return true;
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		setLoading(true);
		try {
			// Format the dates to ISO strings - matching ACTUAL database schema
			const payload: any = {
				cohort_id: formData.cohort_id,
				start_time: new Date(formData.start_time).toISOString(),
				end_time: new Date(formData.end_time).toISOString(),
				status: formData.status,
				teacher_id: formData.teacher_id === "none" || !formData.teacher_id ? null : formData.teacher_id,
				notes: formData.notes || null,
			};

			// Add optional fields only if provided
			if (formData.meeting_link && formData.meeting_link.trim()) {
				payload.meeting_link = formData.meeting_link;
			}

			console.log("Creating class with payload:", payload);

			const response = await fetch("/api/classes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				let errorData;
				try {
					errorData = await response.json();
				} catch (e) {
					errorData = { error: `Request failed with status ${response.status}` };
				}
				
				console.error("Error response:", errorData);
				
				// Handle validation errors with details
				if (errorData && errorData.details && Array.isArray(errorData.details)) {
					const errorMessages = errorData.details.map((detail: any) => 
						detail.message || detail.path?.join('.') || 'Validation error'
					);
					throw new Error(errorMessages.join(', '));
				}
				
				const errorMessage = errorData?.error || errorData?.message || "Failed to create class";
				throw new Error(errorMessage);
			}

			const newClass = await response.json();
			toast.success("Class created successfully");
			
			if (onSuccess) {
				onSuccess(newClass);
			}
			
			onClose();
		} catch (error) {
			console.error("Error creating class:", error);
			const errorMessage = error instanceof Error ? error.message : "Failed to create class";
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const formatDateTimeLocal = (date: string) => {
		if (!date) return "";
		return date.slice(0, 16);
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Create New Class
					</DialogTitle>
					<DialogDescription>
						Schedule a new class for this cohort. You can assign a teacher and set up meeting details.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-6 py-4">
					{/* Date and Time Section */}
					<div className="space-y-4">
						<h3 className="font-medium text-sm">Date & Time</h3>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="start_time" className="flex items-center gap-2">
									<Clock className="h-3.5 w-3.5" />
									Start Time
								</Label>
								<Input
									id="start_time"
									type="datetime-local"
									value={formatDateTimeLocal(formData.start_time)}
									onChange={(e) => handleInputChange("start_time", e.target.value)}
									className="w-full"
									min={new Date().toISOString().slice(0, 16)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="end_time" className="flex items-center gap-2">
									<Clock className="h-3.5 w-3.5" />
									End Time
								</Label>
								<Input
									id="end_time"
									type="datetime-local"
									value={formatDateTimeLocal(formData.end_time)}
									onChange={(e) => handleInputChange("end_time", e.target.value)}
									className="w-full"
									min={formData.start_time}
								/>
							</div>
						</div>
						{formData.start_time && formData.end_time && (
							<p className="text-muted-foreground text-sm">
								Duration: {(() => {
									const start = new Date(formData.start_time);
									const end = new Date(formData.end_time);
									const diff = Math.round((end.getTime() - start.getTime()) / 60000);
									const hours = Math.floor(diff / 60);
									const minutes = diff % 60;
									return hours > 0
										? `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minutes` : ''}`
										: `${minutes} minutes`;
								})()}
							</p>
						)}
					</div>

					{/* Teacher Assignment */}
					<div className="space-y-2">
						<Label htmlFor="teacher" className="flex items-center gap-2">
							<Users className="h-3.5 w-3.5" />
							Teacher (Optional)
						</Label>
						<Select
							value={formData.teacher_id}
							onValueChange={(value) => handleInputChange("teacher_id", value)}
							disabled={loadingTeachers}
						>
							<SelectTrigger id="teacher">
								<SelectValue placeholder={loadingTeachers ? "Loading teachers..." : "Select a teacher"} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">No teacher assigned</SelectItem>
								{teachers.map((teacher) => (
									<SelectItem key={teacher.id} value={teacher.id}>
										{teacher.first_name} {teacher.last_name}
										{teacher.email && (
											<span className="text-muted-foreground ml-2">
												({teacher.email})
											</span>
										)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Meeting Link */}
					<div className="space-y-2">
						<Label htmlFor="meeting_link" className="flex items-center gap-2">
							<Link className="h-3.5 w-3.5" />
							Meeting Link (Optional)
						</Label>
						<Input
							id="meeting_link"
							type="url"
							placeholder="https://meet.google.com/..."
							value={formData.meeting_link}
							onChange={(e) => handleInputChange("meeting_link", e.target.value)}
						/>
						<p className="text-muted-foreground text-xs">
							Add a video conferencing link for online classes
						</p>
					</div>

					{/* Status */}
					<div className="space-y-2">
						<Label htmlFor="status">Status</Label>
						<Select
							value={formData.status}
							onValueChange={(value) => handleInputChange("status", value)}
						>
							<SelectTrigger id="status">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="scheduled">Scheduled</SelectItem>
								<SelectItem value="in_progress">In Progress</SelectItem>
								<SelectItem value="completed">Completed</SelectItem>
								<SelectItem value="cancelled">Cancelled</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Notes */}
					<div className="space-y-2">
						<Label htmlFor="notes">Notes (Optional)</Label>
						<Textarea
							id="notes"
							placeholder="Add any additional notes about this class..."
							value={formData.notes}
							onChange={(e) => handleInputChange("notes", e.target.value)}
							rows={3}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={onClose}
						disabled={loading}
					>
						<X className="mr-2 h-4 w-4" />
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={loading || !formData.start_time || !formData.end_time}
					>
						{loading ? (
							<>
								<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
								Creating...
							</>
						) : (
							<>
								<Save className="mr-2 h-4 w-4" />
								Create Class
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}