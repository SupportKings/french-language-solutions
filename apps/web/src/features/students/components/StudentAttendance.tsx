"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { 
	Calendar,
	Clock,
	CheckCircle,
	XCircle,
	MinusCircle,
	Edit,
	BookOpen,
	Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AttendanceRecord {
	id: string;
	studentId: string;
	cohortId: string;
	classId: string | null;
	attendanceDate: string;
	status: "attended" | "not_attended" | "unset";
	notes: string | null;
	homeworkCompleted: boolean;
	markedBy: string | null;
	markedAt: string | null;
	className: string | null;
	classStartTime: string | null;
	cohortName: string | null;
}

interface AttendanceStats {
	totalClasses: number;
	present: {
		count: number;
		percentage: number;
	};
	absent: {
		count: number;
		percentage: number;
	};
	unset: {
		count: number;
		percentage: number;
	};
}

interface StudentAttendanceProps {
	studentId: string;
}

interface StudentInfo {
	id: string;
	full_name: string;
	email?: string;
}

const statusConfig = {
	attended: {
		label: "Present",
		icon: CheckCircle,
		color: "success",
		bgColor: "bg-green-50 dark:bg-green-950/20",
		textColor: "text-green-600 dark:text-green-400",
	},
	not_attended: {
		label: "Absent",
		icon: XCircle,
		color: "destructive",
		bgColor: "bg-red-50 dark:bg-red-950/20",
		textColor: "text-red-600 dark:text-red-400",
	},
	unset: {
		label: "Not Marked",
		icon: MinusCircle,
		color: "secondary",
		bgColor: "bg-gray-50 dark:bg-gray-950/20",
		textColor: "text-gray-600 dark:text-gray-400",
	},
};

export function StudentAttendance({ studentId }: StudentAttendanceProps) {
	const [records, setRecords] = useState<AttendanceRecord[]>([]);
	const [stats, setStats] = useState<AttendanceStats | null>(null);
	const [student, setStudent] = useState<StudentInfo | null>(null);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState<string | null>(null);
	const [filter, setFilter] = useState<"all" | "attended" | "not_attended" | "unset">("all");
	const [notesDialog, setNotesDialog] = useState<{ 
		open: boolean; 
		recordId: string | null; 
		currentNotes: string 
	}>({ open: false, recordId: null, currentNotes: "" });
	const [noteValue, setNoteValue] = useState("");

	// Fetch student information
	const fetchStudent = async () => {
		try {
			const response = await fetch(`/api/students/${studentId}`);
			if (!response.ok) throw new Error("Failed to fetch student");
			const studentData = await response.json();
			setStudent({
				id: studentData.id,
				full_name: studentData.full_name,
				email: studentData.email,
			});
		} catch (error) {
			console.error("Error fetching student:", error);
		}
	};

	// Fetch attendance data
	const fetchAttendance = async () => {
		try {
			const response = await fetch(`/api/students/${studentId}/attendance`);
			if (!response.ok) throw new Error("Failed to fetch attendance");
			const data = await response.json();
			setRecords(data.records);
			setStats(data.stats);
		} catch (error) {
			console.error("Error fetching attendance:", error);
			toast.error("Failed to load attendance records");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			await Promise.all([fetchStudent(), fetchAttendance()]);
		};
		fetchData();
	}, [studentId]);

	// Update attendance status
	const updateAttendance = async (recordId: string, updates: { status?: string; notes?: string; homeworkCompleted?: boolean }) => {
		setUpdating(recordId);
		try {
			const body: any = { recordId, ...updates };

			const response = await fetch(`/api/students/${studentId}/attendance`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			if (!response.ok) throw new Error("Failed to update attendance");

			// Refresh data
			await fetchAttendance();
			toast.success("Attendance updated successfully");
		} catch (error) {
			console.error("Error updating attendance:", error);
			toast.error("Failed to update attendance");
		} finally {
			setUpdating(null);
		}
	};

	// Open notes dialog
	const openNotesDialog = (record: AttendanceRecord) => {
		setNoteValue(record.notes || "");
		setNotesDialog({ 
			open: true, 
			recordId: record.id, 
			currentNotes: record.notes || "" 
		});
	};

	// Save note
	const saveNote = async () => {
		if (!notesDialog.recordId) return;
		
		await updateAttendance(notesDialog.recordId, { notes: noteValue });
		setNotesDialog({ open: false, recordId: null, currentNotes: "" });
		setNoteValue("");
	};

	// Filter records
	const filteredRecords = filter === "all" 
		? records 
		: records.filter(r => r.status === filter);

	if (loading) {
		return (
			<div className="space-y-4">
				{/* Stats skeleton */}
				<div className="grid grid-cols-4 gap-4">
					{[...Array(4)].map((_, i) => (
						<Skeleton key={i} className="h-20 rounded-lg" />
					))}
				</div>
				{/* Table skeleton */}
				<div className="border rounded-lg">
					<div className="p-4">
						{[...Array(5)].map((_, i) => (
							<Skeleton key={i} className="h-12 mb-2" />
						))}
					</div>
				</div>
			</div>
		);
	}

	if (!stats || records.length === 0) {
		return (
			<div className="border rounded-lg p-8 text-center">
				<Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
				<p className="text-sm font-medium text-muted-foreground mb-1">No attendance records yet</p>
				<p className="text-xs text-muted-foreground">Attendance will appear here once classes begin</p>
			</div>
		);
	}


	return (
		<div className="space-y-4">
			{/* Controls */}
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<Select value={filter} onValueChange={(value: any) => setFilter(value)}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Filter by status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Records</SelectItem>
							<SelectItem value="attended">Present Only</SelectItem>
							<SelectItem value="not_attended">Absent Only</SelectItem>
							<SelectItem value="unset">Not Marked</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Summary Stats */}
				<div className="flex items-center gap-4 text-sm">
					<div className="flex items-center gap-2">
						<CheckCircle className="h-4 w-4 text-green-600" />
						<span>{filteredRecords.filter(r => r.status === "attended").length} Present</span>
					</div>
					<div className="flex items-center gap-2">
						<XCircle className="h-4 w-4 text-red-600" />
						<span>{filteredRecords.filter(r => r.status === "not_attended").length} Absent</span>
					</div>
					<div className="flex items-center gap-2">
						<MinusCircle className="h-4 w-4 text-gray-400" />
						<span>{filteredRecords.filter(r => r.status === "unset").length} Not Marked</span>
					</div>
					<div className="flex items-center gap-2">
						<BookOpen className="h-4 w-4 text-blue-600" />
						<span>
							{filteredRecords.filter(r => r.status === "attended" && r.homeworkCompleted).length}/
							{filteredRecords.filter(r => r.status === "attended").length} Homework
						</span>
					</div>
				</div>
			</div>

			{/* Attendance Table */}
			<div className="border rounded-lg overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/30">
							<TableHead className="w-[120px]">Date</TableHead>
							<TableHead className="w-[100px]">Time</TableHead>
							<TableHead className="w-[120px]">Cohort</TableHead>
							<TableHead className="w-[100px]">Status</TableHead>
							<TableHead className="w-[120px]">Homework</TableHead>
							<TableHead className="min-w-[200px]">Notes</TableHead>
							<TableHead className="w-[180px]">Actions</TableHead>
							<TableHead className="w-[100px]">Marked</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							// Loading skeleton rows
							[...Array(5)].map((_, i) => (
								<TableRow key={i}>
									<TableCell><Skeleton className="h-4 w-full" /></TableCell>
									<TableCell><Skeleton className="h-4 w-full" /></TableCell>
									<TableCell><Skeleton className="h-4 w-full" /></TableCell>
									<TableCell><Skeleton className="h-4 w-full" /></TableCell>
									<TableCell><Skeleton className="h-4 w-full" /></TableCell>
									<TableCell><Skeleton className="h-4 w-full" /></TableCell>
									<TableCell><Skeleton className="h-4 w-full" /></TableCell>
									<TableCell><Skeleton className="h-4 w-full" /></TableCell>
								</TableRow>
							))
						) : filteredRecords.length === 0 ? (
							<TableRow>
								<TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
									No attendance records found
								</TableCell>
							</TableRow>
						) : (
							filteredRecords.map((record) => {
								const isUpdating = updating === record.id;
								const config = statusConfig[record.status as keyof typeof statusConfig];

								return (
									<TableRow key={record.id} className="hover:bg-muted/5">
										{/* Date */}
										<TableCell className="font-medium">
											<div className="text-sm">
												{format(new Date(record.attendanceDate), "MMM d")}
											</div>
											<div className="text-xs text-muted-foreground">
												{format(new Date(record.attendanceDate), "yyyy")}
											</div>
										</TableCell>

										{/* Time */}
										<TableCell>
											{record.classStartTime ? (
												<div className="text-sm">
													{format(new Date(record.classStartTime), "h:mm a")}
												</div>
											) : (
												<span className="text-muted-foreground text-xs">—</span>
											)}
										</TableCell>

										{/* Cohort */}
										<TableCell>
											<div className="text-sm">
												{record.cohortName || "—"}
											</div>
										</TableCell>

										{/* Status */}
										<TableCell>
											<Badge variant="outline" className={cn("text-xs", config.color)}>
												{config.label}
											</Badge>
										</TableCell>

										{/* Homework */}
										<TableCell>
											{record.status === "attended" ? (
												<div 
													className="flex items-center gap-2"
													onClick={(e) => e.stopPropagation()}
												>
													<Checkbox
														id={`homework-${record.id}`}
														checked={record.homeworkCompleted}
														onCheckedChange={(checked) => {
															updateAttendance(record.id, { homeworkCompleted: checked as boolean });
														}}
														disabled={isUpdating}
														className="h-4 w-4"
													/>
													<label 
														htmlFor={`homework-${record.id}`}
														className={cn(
															"flex items-center gap-1 text-xs cursor-pointer",
															record.homeworkCompleted ? "text-blue-600" : "text-muted-foreground"
														)}
													>
														<BookOpen className="h-3 w-3" />
														{record.homeworkCompleted ? "Done" : "Pending"}
													</label>
													{isUpdating && (
														<div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
													)}
												</div>
											) : (
												<span className="text-muted-foreground text-xs">—</span>
											)}
										</TableCell>

										{/* Notes */}
										<TableCell>
											{record.notes ? (
												<Button
													variant="ghost"
													size="sm"
													className="h-auto p-1 text-left justify-start max-w-[200px]"
													onClick={() => openNotesDialog(record)}
												>
													<span className="text-xs truncate block">
														{record.notes}
													</span>
												</Button>
											) : (
												<Button
													variant="ghost"
													size="sm"
													className="h-8 px-2 text-muted-foreground"
													onClick={() => openNotesDialog(record)}
												>
													<Edit className="h-3 w-3 mr-1" />
													<span className="text-xs">Add note</span>
												</Button>
											)}
										</TableCell>

										{/* Action Buttons */}
										<TableCell>
											<div className="flex items-center gap-1">
												<Button
													variant={record.status === "attended" ? "default" : "outline"}
													size="sm"
													className="h-7 px-2"
													onClick={() => updateAttendance(record.id, { status: "attended" })}
													disabled={isUpdating}
													title="Mark as Present"
												>
													{isUpdating && record.status === "attended" ? (
														<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
													) : (
														<CheckCircle className="h-3.5 w-3.5" />
													)}
												</Button>
												<Button
													variant={record.status === "not_attended" ? "destructive" : "outline"}
													size="sm"
													className="h-7 px-2"
													onClick={() => updateAttendance(record.id, { status: "not_attended" })}
													disabled={isUpdating}
													title="Mark as Absent"
												>
													{isUpdating && record.status === "not_attended" ? (
														<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
													) : (
														<XCircle className="h-3.5 w-3.5" />
													)}
												</Button>
												<Button
													variant={record.status === "unset" ? "secondary" : "outline"}
													size="sm"
													className="h-7 px-2"
													onClick={() => updateAttendance(record.id, { status: "unset" })}
													disabled={isUpdating}
													title="Clear Status"
												>
													{isUpdating && record.status === "unset" ? (
														<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
													) : (
														<MinusCircle className="h-3.5 w-3.5" />
													)}
												</Button>
											</div>
										</TableCell>

										{/* Marked At */}
										<TableCell>
											{record.markedAt ? (
												<div className="text-xs text-muted-foreground">
													{format(new Date(record.markedAt), "MMM d")}
												</div>
											) : (
												<span className="text-muted-foreground text-xs">—</span>
											)}
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>

			{/* Notes Dialog */}
			<Dialog open={notesDialog.open} onOpenChange={(open) => {
				if (!open) {
					setNotesDialog({ open: false, recordId: null, currentNotes: "" });
					setNoteValue("");
				}
			}}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Attendance Note</DialogTitle>
						<DialogDescription>
							Add or edit notes for this attendance record.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Textarea
							value={noteValue}
							onChange={(e) => setNoteValue(e.target.value)}
							placeholder="Enter attendance note..."
							className="min-h-[100px]"
						/>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setNotesDialog({ open: false, recordId: null, currentNotes: "" });
								setNoteValue("");
							}}
						>
							Cancel
						</Button>
						<Button onClick={saveNote} disabled={updating === notesDialog.recordId}>
							{updating === notesDialog.recordId ? (
								<>
									<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
									Saving...
								</>
							) : (
								<>
									<Save className="mr-2 h-4 w-4" />
									Save Note
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}