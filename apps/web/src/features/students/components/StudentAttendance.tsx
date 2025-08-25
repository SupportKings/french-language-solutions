"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
	Check,
	X,
	Clock,
	MoreVertical,
	AlertCircle,
	CheckCircle,
	XCircle,
	MinusCircle,
	Edit,
	FileText,
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
	const updateAttendance = async (recordId: string, status?: string, notes?: string) => {
		setUpdating(recordId);
		try {
			const body: any = { recordId };
			if (status !== undefined) body.status = status;
			if (notes !== undefined) body.notes = notes;

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
		
		await updateAttendance(noteDialog.recordId, undefined, noteValue);
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
			<div className="space-y-4">
				{/* Empty stats */}
				<div className="grid grid-cols-4 gap-4">
					<div className="bg-muted/50 rounded-lg p-3">
						<p className="text-xs text-muted-foreground mb-1">Total Classes</p>
						<p className="text-2xl font-semibold">0</p>
					</div>
					<div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
						<p className="text-xs text-green-600 dark:text-green-400 mb-1">Present</p>
						<p className="text-2xl font-semibold text-green-600 dark:text-green-400">0</p>
						<p className="text-xs text-muted-foreground">0%</p>
					</div>
					<div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3">
						<p className="text-xs text-red-600 dark:text-red-400 mb-1">Absent</p>
						<p className="text-2xl font-semibold text-red-600 dark:text-red-400">0</p>
						<p className="text-xs text-muted-foreground">0%</p>
					</div>
					<div className="bg-gray-50 dark:bg-gray-950/20 rounded-lg p-3">
						<p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Not Marked</p>
						<p className="text-2xl font-semibold text-gray-600 dark:text-gray-400">0</p>
						<p className="text-xs text-muted-foreground">0%</p>
					</div>
				</div>

				<div className="border rounded-lg p-8 text-center">
					<Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
					<p className="text-sm font-medium text-muted-foreground mb-1">No attendance records yet</p>
					<p className="text-xs text-muted-foreground">Attendance will appear here once classes begin</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Attendance Statistics */}
			<div className="grid grid-cols-4 gap-4">
				<div className="bg-muted/50 rounded-lg p-3">
					<p className="text-xs text-muted-foreground mb-1">Total Classes</p>
					<p className="text-2xl font-semibold">{stats.totalClasses}</p>
				</div>
				<div className={cn("rounded-lg p-3", statusConfig.attended.bgColor)}>
					<p className={cn("text-xs mb-1", statusConfig.attended.textColor)}>Present</p>
					<p className={cn("text-2xl font-semibold", statusConfig.attended.textColor)}>
						{stats.present.count}
					</p>
					<p className="text-xs text-muted-foreground">{stats.present.percentage}%</p>
				</div>
				<div className={cn("rounded-lg p-3", statusConfig.not_attended.bgColor)}>
					<p className={cn("text-xs mb-1", statusConfig.not_attended.textColor)}>Absent</p>
					<p className={cn("text-2xl font-semibold", statusConfig.not_attended.textColor)}>
						{stats.absent.count}
					</p>
					<p className="text-xs text-muted-foreground">{stats.absent.percentage}%</p>
				</div>
				<div className={cn("rounded-lg p-3", statusConfig.unset.bgColor)}>
					<p className={cn("text-xs mb-1", statusConfig.unset.textColor)}>Not Marked</p>
					<p className={cn("text-2xl font-semibold", statusConfig.unset.textColor)}>
						{stats.unset.count}
					</p>
					<p className="text-xs text-muted-foreground">{stats.unset.percentage}%</p>
				</div>
			</div>

			{/* Filter */}
			<div className="flex items-center justify-between">
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
				<p className="text-sm text-muted-foreground">
					Showing {filteredRecords.length} of {records.length} records
				</p>
			</div>

			{/* Attendance Table */}
			<div className="border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Date</TableHead>
							<TableHead>Class/Cohort</TableHead>
							<TableHead>Time</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Notes</TableHead>
							<TableHead className="w-[50px]"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredRecords.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
									No records found for the selected filter
								</TableCell>
							</TableRow>
						) : (
							filteredRecords.map((record) => {
								const StatusIcon = statusConfig[record.status].icon;
								const isUpdating = updating === record.id;

								return (
									<TableRow key={record.id}>
										<TableCell>
											<div className="flex items-center gap-2">
												<Calendar className="h-3.5 w-3.5 text-muted-foreground" />
												<span className="font-medium">
													{format(new Date(record.attendanceDate), "MMM d, yyyy")}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<div>
												<p className="text-sm font-medium">
													{record.className || record.cohortName || "Daily Attendance"}
												</p>
												{record.cohortName && record.className && (
													<p className="text-xs text-muted-foreground">{record.cohortName}</p>
												)}
											</div>
										</TableCell>
										<TableCell>
											{record.classStartTime ? (
												<div className="flex items-center gap-1">
													<Clock className="h-3 w-3 text-muted-foreground" />
													<span className="text-sm">
														{format(new Date(record.classStartTime), "h:mm a")}
													</span>
												</div>
											) : (
												<span className="text-sm text-muted-foreground">—</span>
											)}
										</TableCell>
										<TableCell>
											<Badge 
												variant={statusConfig[record.status].color as any}
												className="gap-1"
											>
												<StatusIcon className="h-3 w-3" />
												{statusConfig[record.status].label}
											</Badge>
										</TableCell>
										<TableCell>
											{record.notes ? (
												<div className="flex items-start gap-1 max-w-[200px]">
													<FileText className="h-3 w-3 text-muted-foreground mt-0.5" />
													<span className="text-xs text-muted-foreground truncate" title={record.notes}>
														{record.notes}
													</span>
												</div>
											) : (
												<span className="text-xs text-muted-foreground">—</span>
											)}
										</TableCell>
										<TableCell>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button 
														variant="ghost" 
														size="icon"
														className="h-8 w-8"
														disabled={isUpdating}
													>
														{isUpdating ? (
															<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
														) : (
															<MoreVertical className="h-4 w-4" />
														)}
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem 
														onClick={() => updateAttendance(record.id, "attended")}
														disabled={record.status === "attended"}
													>
														<CheckCircle className="mr-2 h-4 w-4 text-green-600" />
														Mark Present
													</DropdownMenuItem>
													<DropdownMenuItem 
														onClick={() => updateAttendance(record.id, "not_attended")}
														disabled={record.status === "not_attended"}
													>
														<XCircle className="mr-2 h-4 w-4 text-red-600" />
														Mark Absent
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem onClick={() => openNoteDialog(record)}>
														<Edit className="mr-2 h-4 w-4" />
														{record.notes ? "Edit Note" : "Add Note"}
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
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