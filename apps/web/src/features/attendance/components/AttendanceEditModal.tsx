"use client";

import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Calendar, User, Clock, CheckCircle, XCircle, HelpCircle, Save } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface AttendanceRecord {
	id: string;
	studentId: string;
	cohortId: string;
	classId?: string;
	attendanceDate: string;
	status: "unset" | "attended" | "not_attended";
	notes?: string;
	markedBy?: string;
	markedAt?: string;
	student?: {
		id: string;
		full_name: string;
		email?: string;
		phone?: string;
	};
	class?: {
		id: string;
		start_time: string;
		end_time: string;
	};
	teacher?: {
		id: string;
		first_name: string;
		last_name: string;
	};
}

interface AttendanceEditModalProps {
	open: boolean;
	onClose: () => void;
	record: AttendanceRecord | null;
	onUpdate: (record: AttendanceRecord) => void;
}

export function AttendanceEditModal({
	open,
	onClose,
	record,
	onUpdate,
}: AttendanceEditModalProps) {
	const [status, setStatus] = useState(record?.status || "unset");
	const [notes, setNotes] = useState(record?.notes || "");
	const [saving, setSaving] = useState(false);

	// Update state when record changes
	React.useEffect(() => {
		if (record) {
			setStatus(record.status);
			setNotes(record.notes || "");
		}
	}, [record]);

	const handleSave = async () => {
		if (!record) return;

		setSaving(true);
		try {
			const response = await fetch(`/api/attendance/${record.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status, notes }),
			});

			if (!response.ok) throw new Error("Failed to update attendance");

			const updatedRecord = await response.json();
			onUpdate(updatedRecord);
			toast.success("Attendance record updated");
			onClose();
		} catch (error) {
			console.error("Error updating attendance:", error);
			toast.error("Failed to update attendance");
		} finally {
			setSaving(false);
		}
	};

	const getStatusIcon = (statusValue: string) => {
		switch (statusValue) {
			case "attended":
				return <CheckCircle className="h-5 w-5 text-green-600" />;
			case "not_attended":
				return <XCircle className="h-5 w-5 text-red-600" />;
			default:
				return <HelpCircle className="h-5 w-5 text-gray-400" />;
		}
	};

	const getStatusBadge = (statusValue: string) => {
		const statusConfig = {
			attended: { label: "Present", className: "bg-green-500/10 text-green-700 border-green-200" },
			not_attended: { label: "Absent", className: "bg-red-500/10 text-red-700 border-red-200" },
			unset: { label: "Not Marked", className: "bg-gray-500/10 text-gray-700 border-gray-200" },
		};
		const config = statusConfig[statusValue as keyof typeof statusConfig] || statusConfig.unset;
		
		return (
			<Badge variant="outline" className={`${config.className}`}>
				{config.label}
			</Badge>
		);
	};

	if (!record) return null;

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Edit Attendance Record</DialogTitle>
					<DialogDescription>
						Update attendance status and notes for this student.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Student Info */}
					<div className="rounded-lg bg-muted/30 p-4 space-y-3">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
								<User className="h-5 w-5 text-primary" />
							</div>
							<div className="flex-1">
								<p className="font-medium">{record.student?.full_name || "Unknown Student"}</p>
								{record.student?.email && (
									<p className="text-sm text-muted-foreground">{record.student.email}</p>
								)}
							</div>
						</div>
					</div>

					{/* Class Info */}
					{record.class && (
						<div className="space-y-2">
							<Label className="text-xs text-muted-foreground">Class</Label>
							<div className="flex items-center gap-2 text-sm">
								<Calendar className="h-4 w-4 text-muted-foreground" />
								<span>Class {record.class.id}</span>
								<span className="text-muted-foreground">•</span>
								<span>{format(new Date(record.class.start_time), "MMM d, yyyy 'at' h:mm a")}</span>
							</div>
						</div>
					)}

					{/* Attendance Status */}
					<div className="space-y-2">
						<Label>Attendance Status</Label>
						<div className="grid grid-cols-3 gap-2">
							<Button
								type="button"
								variant={status === "attended" ? "default" : "outline"}
								className={status === "attended" ? "bg-green-600 hover:bg-green-700" : ""}
								onClick={() => setStatus("attended")}
							>
								<CheckCircle className="h-4 w-4 mr-2" />
								Present
							</Button>
							<Button
								type="button"
								variant={status === "not_attended" ? "destructive" : "outline"}
								onClick={() => setStatus("not_attended")}
							>
								<XCircle className="h-4 w-4 mr-2" />
								Absent
							</Button>
							<Button
								type="button"
								variant={status === "unset" ? "secondary" : "outline"}
								onClick={() => setStatus("unset")}
							>
								<HelpCircle className="h-4 w-4 mr-2" />
								Unset
							</Button>
						</div>
					</div>

					{/* Notes */}
					<div className="space-y-2">
						<Label htmlFor="notes">Notes (Optional)</Label>
						<Textarea
							id="notes"
							placeholder="Add any notes about this attendance record..."
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							rows={3}
						/>
					</div>

					{/* Last Modified Info */}
					{record.markedAt && (
						<div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
							<div className="flex items-center gap-1">
								<Clock className="h-3 w-3" />
								<span>Last updated: {format(new Date(record.markedAt), "MMM d, yyyy 'at' h:mm a")}</span>
							</div>
							{record.teacher && (
								<div className="flex items-center gap-1 ml-4">
									<span>by {record.teacher.first_name} {record.teacher.last_name}</span>
								</div>
							)}
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={saving}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={saving}>
						{saving ? (
							<>Saving...</>
						) : (
							<>
								<Save className="h-4 w-4 mr-2" />
								Save Changes
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}