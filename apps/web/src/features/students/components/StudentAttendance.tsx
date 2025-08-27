"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
	Calendar,
	Clock,
	CheckCircle,
	XCircle,
	MinusCircle,
	Edit,
	Save,
	BookOpen
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
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState<string | null>(null);
	const [filter, setFilter] = useState<"all" | "attended" | "not_attended" | "unset">("all");
	const [noteDialog, setNoteDialog] = useState<{ open: boolean; recordId: string | null; currentNote: string }>({ 
		open: false, 
		recordId: null, 
		currentNote: "" 
	});
	const [noteValue, setNoteValue] = useState("");

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
		fetchAttendance();
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

	// Open note dialog
	const openNoteDialog = (record: AttendanceRecord) => {
		setNoteValue(record.notes || "");
		setNoteDialog({ open: true, recordId: record.id, currentNote: record.notes || "" });
	};

	// Save note
	const saveNote = async () => {
		if (!noteDialog.recordId) return;
		
		await updateAttendance(noteDialog.recordId, { notes: noteValue });
		setNoteDialog({ open: false, recordId: null, currentNote: "" });
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

	// Group records by month
	const groupedRecords = filteredRecords.reduce((acc, record) => {
		const date = new Date(record.attendanceDate);
		const monthKey = format(date, "MMMM yyyy");
		if (!acc[monthKey]) {
			acc[monthKey] = [];
		}
		acc[monthKey].push(record);
		return acc;
	}, {} as Record<string, AttendanceRecord[]>);

	// Sort months (newest first)
	const sortedMonths = Object.keys(groupedRecords).sort((a, b) => {
		return new Date(b).getTime() - new Date(a).getTime();
	});

	// Helper to get status icon
	const getStatusIcon = (status: string) => {
		const config = statusConfig[status as keyof typeof statusConfig];
		const Icon = config.icon;
		return <Icon className={cn("h-4 w-4", config.textColor)} />;
	};

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

			{/* Grouped Attendance Records */}
			<div className="space-y-4">
				{sortedMonths.length === 0 ? (
					<div className="border rounded-lg p-8 text-center">
						<p className="text-muted-foreground">No records found for the selected filter</p>
					</div>
				) : (
					sortedMonths.map((month) => {
						const monthRecords = groupedRecords[month];
						const attendedCount = monthRecords.filter(r => r.status === "attended").length;
						const totalCount = monthRecords.length;
						const attendanceRate = totalCount > 0 ? (attendedCount / totalCount * 100).toFixed(0) : 0;

						return (
							<div key={month} className="border rounded-lg overflow-hidden">
								<div className="bg-muted/30 px-4 py-3 border-b">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<Calendar className="h-4 w-4 text-muted-foreground" />
											<h3 className="font-medium">{month}</h3>
										</div>
										<div className="flex items-center gap-3">
											<span className="text-sm text-muted-foreground">
												{attendedCount}/{totalCount} attended
											</span>
											<Badge variant="outline" className="text-xs">
												{attendanceRate}% attendance
											</Badge>
										</div>
									</div>
								</div>

								<div className="divide-y">
									{monthRecords.map((record) => {
										const isUpdating = updating === record.id;

										return (
											<div
												key={record.id}
												className="px-4 py-3 hover:bg-muted/10 transition-colors cursor-pointer group"
												onClick={() => openNoteDialog(record)}
											>
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-3 flex-1">
														{getStatusIcon(record.status)}
														<div className="flex-1">
															<div className="flex items-center gap-2">
																<span className="font-medium text-sm">
																	{format(new Date(record.attendanceDate), "EEEE, MMM d")}
																</span>
																{record.classStartTime && (
																	<span className="text-xs text-muted-foreground">
																		at {format(new Date(record.classStartTime), "h:mm a")}
																	</span>
																)}
															</div>
															<div className="text-xs text-muted-foreground mt-0.5">
																{record.cohortName || "No cohort info"}
															</div>
														</div>
													</div>

													<div className="flex items-center gap-3">
														{record.notes && (
															<span className="text-xs text-muted-foreground max-w-[200px] truncate">
																{record.notes}
															</span>
														)}

														{record.markedAt && (
															<div className="text-xs text-muted-foreground">
																Marked {format(new Date(record.markedAt), "MMM d")}
															</div>
														)}

														{/* Homework Checkbox */}
														{record.status === "attended" && (
															<div className="flex items-center gap-1.5">
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
																	className="text-xs font-medium cursor-pointer flex items-center gap-1"
																>
																	<BookOpen className="h-3 w-3" />
																	Homework
																</label>
															</div>
														)}

														<div className="flex items-center gap-1">
															<Button
																variant="ghost"
																size="sm"
																className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
																onClick={(e) => {
																	e.stopPropagation();
																	openNoteDialog(record);
																}}
																disabled={isUpdating}
															>
																<Edit className="h-3.5 w-3.5" />
															</Button>
															<Button
																variant={record.status === "attended" ? "default" : "outline"}
																size="sm"
																className="h-7 px-2"
																onClick={(e) => {
																	e.stopPropagation();
																	updateAttendance(record.id, { status: "attended" });
																}}
																disabled={isUpdating}
															>
																{isUpdating ? (
																	<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
																) : (
																	<CheckCircle className="h-3.5 w-3.5" />
																)}
															</Button>
															<Button
																variant={record.status === "not_attended" ? "destructive" : "outline"}
																size="sm"
																className="h-7 px-2"
																onClick={(e) => {
																	e.stopPropagation();
																	updateAttendance(record.id, { status: "not_attended" });
																}}
																disabled={isUpdating}
															>
																{isUpdating ? (
																	<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
																) : (
																	<XCircle className="h-3.5 w-3.5" />
																)}
															</Button>
															{record.status !== "unset" && (
																<Button
																	variant="ghost"
																	size="sm"
																	className="h-7 px-2"
																	onClick={(e) => {
																		e.stopPropagation();
																		updateAttendance(record.id, { status: "unset" });
																	}}
																	disabled={isUpdating}
																>
																	{isUpdating ? (
																		<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
																	) : (
																		<MinusCircle className="h-3.5 w-3.5" />
																	)}
																</Button>
															)}
														</div>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						);
					})
				)}
			</div>

			{/* Note Dialog */}
			<Dialog open={noteDialog.open} onOpenChange={(open) => {
				if (!open) {
					setNoteDialog({ open: false, recordId: null, currentNote: "" });
					setNoteValue("");
				}
			}}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add Attendance Note</DialogTitle>
						<DialogDescription>
							Add a note for this attendance record. This can be helpful for tracking special circumstances.
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
								setNoteDialog({ open: false, recordId: null, currentNote: "" });
								setNoteValue("");
							}}
						>
							Cancel
						</Button>
						<Button onClick={saveNote} disabled={updating === noteDialog.recordId}>
							{updating === noteDialog.recordId ? (
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