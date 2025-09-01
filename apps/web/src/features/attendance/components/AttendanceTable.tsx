"use client";

import { useState } from "react";

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
	User,
	XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface AttendanceRecord {
	id: string;
	studentId: string;
	student?: {
		id: string;
		full_name: string;
		email?: string;
	};
	cohortId: string;
	classId: string | null;
	class?: {
		id: string;
		start_time: string;
		end_time: string;
		status?: string;
	};
	attendanceDate: string | null;
	status: "attended" | "not_attended" | "unset";
	notes: string | null;
	homeworkCompleted: boolean;
	markedBy?: string | null;
	markedAt?: string | null;
}

interface AttendanceTableProps {
	records: AttendanceRecord[];
	onUpdateAttendance?: (
		recordId: string,
		updates: { status?: string; notes?: string; homeworkCompleted?: boolean },
	) => Promise<void>;
	loading?: boolean;
	showStudent?: boolean;
	showCohort?: boolean;
	readOnly?: boolean;
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
		label: "Not marked",
		icon: MinusCircle,
		color: "secondary",
		bgColor: "bg-gray-50 dark:bg-gray-950/20",
		textColor: "text-gray-600 dark:text-gray-400",
	},
};

export function AttendanceTable({
	records,
	onUpdateAttendance,
	loading = false,
	showStudent = false,
	showCohort = false,
	readOnly = false,
}: AttendanceTableProps) {
	const [updating, setUpdating] = useState<string | null>(null);
	const [notesDialog, setNotesDialog] = useState<{
		open: boolean;
		recordId: string | null;
		currentNotes: string;
	}>({ open: false, recordId: null, currentNotes: "" });
	const [noteValue, setNoteValue] = useState("");
	const [filter, setFilter] = useState<
		"all" | "attended" | "not_attended" | "unset"
	>("all");

	// Update attendance
	const handleUpdateAttendance = async (
		recordId: string,
		updates: { status?: string; notes?: string; homeworkCompleted?: boolean },
	) => {
		if (!onUpdateAttendance || readOnly) return;

		setUpdating(recordId);
		try {
			await onUpdateAttendance(recordId, updates);
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
		if (readOnly) return;
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

		await handleUpdateAttendance(notesDialog.recordId, { notes: noteValue });
		setNotesDialog({ open: false, recordId: null, currentNotes: "" });
		setNoteValue("");
	};

	// Filter records
	const filteredRecords =
		filter === "all" ? records : records.filter((r) => r.status === filter);

	// Calculate stats
	const stats = {
		total: records.length,
		present: records.filter((r) => r.status === "attended").length,
		absent: records.filter((r) => r.status === "not_attended").length,
		unset: records.filter((r) => r.status === "unset").length,
	};

	return (
		<div className="space-y-4">
			{/* Stats Overview */}
			<div className="grid grid-cols-4 gap-4">
				<div className="rounded-lg border bg-card p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-muted-foreground text-xs">Total Classes</p>
							<p className="font-semibold text-2xl">{stats.total}</p>
						</div>
						<Calendar className="h-8 w-8 text-muted-foreground/20" />
					</div>
				</div>
				<div className="rounded-lg border bg-green-50 p-4 dark:bg-green-950/20">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-green-600 text-xs dark:text-green-400">
								Present
							</p>
							<p className="font-semibold text-2xl text-green-700 dark:text-green-300">
								{stats.present}
							</p>
							<p className="text-green-600 text-xs dark:text-green-400">
								{stats.total > 0
									? `${Math.round((stats.present / stats.total) * 100)}%`
									: "0%"}
							</p>
						</div>
						<CheckCircle className="h-8 w-8 text-green-600/20 dark:text-green-400/20" />
					</div>
				</div>
				<div className="rounded-lg border bg-red-50 p-4 dark:bg-red-950/20">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-red-600 text-xs dark:text-red-400">Absent</p>
							<p className="font-semibold text-2xl text-red-700 dark:text-red-300">
								{stats.absent}
							</p>
							<p className="text-red-600 text-xs dark:text-red-400">
								{stats.total > 0
									? `${Math.round((stats.absent / stats.total) * 100)}%`
									: "0%"}
							</p>
						</div>
						<XCircle className="h-8 w-8 text-red-600/20 dark:text-red-400/20" />
					</div>
				</div>
				<div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-950/20">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-600 text-xs dark:text-gray-400">
								Not Marked
							</p>
							<p className="font-semibold text-2xl text-gray-700 dark:text-gray-300">
								{stats.unset}
							</p>
							<p className="text-gray-600 text-xs dark:text-gray-400">
								{stats.total > 0
									? `${Math.round((stats.unset / stats.total) * 100)}%`
									: "0%"}
							</p>
						</div>
						<MinusCircle className="h-8 w-8 text-gray-600/20 dark:text-gray-400/20" />
					</div>
				</div>
			</div>

			{/* Filter */}
			<div className="flex items-center justify-between">
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
				<p className="text-muted-foreground text-sm">
					Showing {filteredRecords.length} of {records.length} records
				</p>
			</div>

			{/* Table */}
			<div className="rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[140px]">Date</TableHead>
							{showStudent && <TableHead>Student</TableHead>}
							<TableHead className="w-[120px]">Time</TableHead>
							<TableHead className="w-[140px]">Status</TableHead>
							<TableHead className="w-[100px]">Homework</TableHead>
							<TableHead>Notes</TableHead>
							{!readOnly && <TableHead className="w-[80px]">Action</TableHead>}
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredRecords.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={showStudent ? 7 : 6}
									className="py-8 text-center"
								>
									<Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
									<p className="text-muted-foreground text-sm">
										No attendance records found
									</p>
								</TableCell>
							</TableRow>
						) : (
							filteredRecords.map((record) => {
								const config = statusConfig[record.status];
								const isUpdating = updating === record.id;

								return (
									<TableRow key={record.id} className="group">
										<TableCell className="font-medium">
											{record.attendanceDate ? (
												<div className="flex items-center gap-2">
													<Calendar className="h-3.5 w-3.5 text-muted-foreground" />
													<span className="text-sm">
														{format(
															new Date(record.attendanceDate),
															"MMM d, yyyy",
														)}
													</span>
												</div>
											) : (
												<span className="text-muted-foreground">-</span>
											)}
										</TableCell>
										{showStudent && (
											<TableCell>
												<div className="flex items-center gap-2">
													<User className="h-3.5 w-3.5 text-muted-foreground" />
													<span className="text-sm">
														{record.student?.full_name || "Unknown"}
													</span>
												</div>
											</TableCell>
										)}
										<TableCell>
											{record.class ? (
												<div className="flex items-center gap-2">
													<Clock className="h-3.5 w-3.5 text-muted-foreground" />
													<span className="text-muted-foreground text-xs">
														{format(
															new Date(record.class.start_time),
															"h:mm a",
														)}
													</span>
												</div>
											) : (
												<span className="text-muted-foreground text-xs">-</span>
											)}
										</TableCell>
										<TableCell>
											{readOnly ? (
												<div
													className={cn(
														"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
														config.bgColor,
													)}
												>
													<config.icon
														className={cn("h-3.5 w-3.5", config.textColor)}
													/>
													<span
														className={cn(
															"font-medium text-xs",
															config.textColor,
														)}
													>
														{config.label}
													</span>
												</div>
											) : (
												<Select
													value={record.status}
													onValueChange={(value) =>
														handleUpdateAttendance(record.id, {
															status: value,
														})
													}
													disabled={isUpdating}
												>
													<SelectTrigger
														className={cn(
															"h-8 w-[130px]",
															isUpdating && "opacity-50",
														)}
													>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="attended">
															<div className="flex items-center gap-2">
																<CheckCircle className="h-3.5 w-3.5 text-green-600" />
																<span>Present</span>
															</div>
														</SelectItem>
														<SelectItem value="not_attended">
															<div className="flex items-center gap-2">
																<XCircle className="h-3.5 w-3.5 text-red-600" />
																<span>Absent</span>
															</div>
														</SelectItem>
														<SelectItem value="unset">
															<div className="flex items-center gap-2">
																<MinusCircle className="h-3.5 w-3.5 text-gray-600" />
																<span>Not marked</span>
															</div>
														</SelectItem>
													</SelectContent>
												</Select>
											)}
										</TableCell>
										<TableCell>
											<Checkbox
												checked={record.homeworkCompleted}
												onCheckedChange={(checked) =>
													!readOnly &&
													handleUpdateAttendance(record.id, {
														homeworkCompleted: checked as boolean,
													})
												}
												disabled={isUpdating || readOnly}
												className={cn(isUpdating && "opacity-50")}
											/>
										</TableCell>
										<TableCell>
											{record.notes ? (
												<Badge
													variant="secondary"
													className="cursor-pointer gap-1 text-xs"
													onClick={() => !readOnly && openNotesDialog(record)}
												>
													<BookOpen className="h-3 w-3" />
													Note
												</Badge>
											) : (
												<span className="text-muted-foreground text-xs">-</span>
											)}
										</TableCell>
										{!readOnly && (
											<TableCell>
												<Button
													size="sm"
													variant="ghost"
													onClick={() => openNotesDialog(record)}
													disabled={isUpdating}
												>
													<Edit className="h-3.5 w-3.5" />
												</Button>
											</TableCell>
										)}
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>

			{/* Notes Dialog */}
			<Dialog open={notesDialog.open} onOpenChange={(open) => !open && setNotesDialog({ open: false, recordId: null, currentNotes: "" })}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add/Edit Note</DialogTitle>
						<DialogDescription>
							Add any relevant notes about this attendance record.
						</DialogDescription>
					</DialogHeader>
					<Textarea
						value={noteValue}
						onChange={(e) => setNoteValue(e.target.value)}
						placeholder="Enter notes..."
						className="min-h-[100px]"
					/>
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
						<Button onClick={saveNote}>
							<Save className="mr-2 h-4 w-4" />
							Save Note
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}