"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import { format } from "date-fns";
import {
	BookOpen,
	Calendar,
	CheckCircle,
	Clock,
	Edit,
	MinusCircle,
	Save,
	XCircle,
} from "lucide-react";
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
	const [filter, setFilter] = useState<
		"all" | "attended" | "not_attended" | "unset"
	>("all");
	const [notesDialog, setNotesDialog] = useState<{
		open: boolean;
		recordId: string | null;
		currentNotes: string;
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
	const updateAttendance = async (
		recordId: string,
		updates: { status?: string; notes?: string; homeworkCompleted?: boolean },
	) => {
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
			currentNotes: record.notes || "",
		});
	};

	// Save note
	const saveNote = async () => {
		if (!notesDialog.recordId) return;

		await updateAttendance(notesDialog.recordId, { notes: noteValue });
		setNotesDialog({ open: false, recordId: null, currentNotes: "" });
		setNoteValue("");
	};

	// Filter and sort records by class date (descending)
	const filteredRecords = (
		filter === "all" ? records : records.filter((r) => r.status === filter)
	).sort((a, b) => {
		// Sort by class start time first, then fall back to attendance date
		const dateA = new Date(a.classStartTime || a.attendanceDate);
		const dateB = new Date(b.classStartTime || b.attendanceDate);
		return dateB.getTime() - dateA.getTime(); // Descending order
	});

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
				<div className="rounded-lg border">
					<div className="p-4">
						{[...Array(5)].map((_, i) => (
							<Skeleton key={i} className="mb-2 h-12" />
						))}
					</div>
				</div>
			</div>
		);
	}

	if (!stats || records.length === 0) {
		return (
			<div className="rounded-lg border p-8 text-center">
				<Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
				<p className="mb-1 font-medium text-muted-foreground text-sm">
					No attendance records yet
				</p>
				<p className="text-muted-foreground text-xs">
					Attendance will appear here once classes begin
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Controls */}
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<Select
						value={filter}
						onValueChange={(value: any) => setFilter(value)}
					>
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
						<span>
							{filteredRecords.filter((r) => r.status === "attended").length}{" "}
							Present
						</span>
					</div>
					<div className="flex items-center gap-2">
						<XCircle className="h-4 w-4 text-red-600" />
						<span>
							{
								filteredRecords.filter((r) => r.status === "not_attended")
									.length
							}{" "}
							Absent
						</span>
					</div>
					<div className="flex items-center gap-2">
						<MinusCircle className="h-4 w-4 text-gray-400" />
						<span>
							{filteredRecords.filter((r) => r.status === "unset").length} Not
							Marked
						</span>
					</div>
					<div className="flex items-center gap-2">
						<BookOpen className="h-4 w-4 text-blue-600" />
						<span>
							{
								filteredRecords.filter(
									(r) => r.status === "attended" && r.homeworkCompleted,
								).length
							}
							/{filteredRecords.filter((r) => r.status === "attended").length}{" "}
							Homework
						</span>
					</div>
				</div>
			</div>

			{/* Attendance Table */}
			<div className="overflow-hidden rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/30">
							<TableHead className="w-[120px]">Date</TableHead>
							<TableHead className="w-[100px]">Time</TableHead>
							<TableHead className="w-[120px]">Cohort</TableHead>
							<TableHead className="w-[100px]">Homework</TableHead>
							<TableHead className="w-[120px]">Status</TableHead>
							<TableHead className="min-w-[200px]">Notes</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							// Loading skeleton rows
							[...Array(5)].map((_, i) => (
								<TableRow key={i}>
									<TableCell>
										<Skeleton className="h-4 w-full" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-full" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-full" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-full" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-full" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-full" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-full" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-full" />
									</TableCell>
								</TableRow>
							))
						) : filteredRecords.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={6}
									className="py-8 text-center text-muted-foreground"
								>
									No attendance records found
								</TableCell>
							</TableRow>
						) : (
							filteredRecords.map((record) => {
								const isUpdating = updating === record.id;
								const config =
									statusConfig[record.status as keyof typeof statusConfig];

								return (
									<TableRow key={record.id} className="hover:bg-muted/5">
										{/* Date */}
										<TableCell className="font-medium">
											<div className="text-sm">
												{format(new Date(record.attendanceDate), "MMM d")}
											</div>
											<div className="text-muted-foreground text-xs">
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
											<div className="text-sm">{record.cohortName || "—"}</div>
										</TableCell>

										{/* Homework */}
										<TableCell>
											<Select
												value={
													record.homeworkCompleted ? "completed" : "pending"
												}
												onValueChange={(value) => {
													updateAttendance(record.id, {
														homeworkCompleted: value === "completed",
													});
												}}
												disabled={isUpdating}
											>
												<SelectTrigger className="h-9 w-[150px]">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="completed">
														<div className="flex items-center gap-2">
															<CheckCircle className="h-3.5 w-3.5 text-green-600" />
															Completed
														</div>
													</SelectItem>
													<SelectItem value="pending">
														<div className="flex items-center gap-2">
															<Clock className="h-3.5 w-3.5 text-amber-600" />
															Pending
														</div>
													</SelectItem>
												</SelectContent>
											</Select>
										</TableCell>

										{/* Attendance */}
										<TableCell>
											<Select
												value={record.status}
												onValueChange={(value) => {
													updateAttendance(record.id, { status: value });
												}}
												disabled={isUpdating}
											>
												<SelectTrigger className="h-9 w-[150px]">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="attended">
														<div className="flex items-center gap-2">
															<CheckCircle className="h-3.5 w-3.5 text-green-600" />
															Present
														</div>
													</SelectItem>
													<SelectItem value="not_attended">
														<div className="flex items-center gap-2">
															<XCircle className="h-3.5 w-3.5 text-red-600" />
															Absent
														</div>
													</SelectItem>
													<SelectItem value="unset">
														<div className="flex items-center gap-2">
															<MinusCircle className="h-3.5 w-3.5 text-gray-400" />
															Not Marked
														</div>
													</SelectItem>
												</SelectContent>
											</Select>
										</TableCell>

										{/* Notes */}
										<TableCell>
											{record.notes ? (
												<Button
													variant="ghost"
													size="sm"
													className="h-auto max-w-[200px] justify-start p-1 text-left"
													onClick={() => openNotesDialog(record)}
												>
													<span className="block truncate text-xs">
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
													<Edit className="mr-1 h-3 w-3" />
													<span className="text-xs">Add note</span>
												</Button>
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
			<Dialog
				open={notesDialog.open}
				onOpenChange={(open) => {
					if (!open) {
						setNotesDialog({ open: false, recordId: null, currentNotes: "" });
						setNoteValue("");
					}
				}}
			>
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
								setNotesDialog({
									open: false,
									recordId: null,
									currentNotes: "",
								});
								setNoteValue("");
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={saveNote}
							disabled={updating === notesDialog.recordId}
						>
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
