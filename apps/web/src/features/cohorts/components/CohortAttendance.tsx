"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Clock,
	Edit,
	MinusCircle,
	Plus,
	Save,
	Search,
	User,
	UserPlus,
	XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface AttendanceRecord {
	id: string;
	studentId: string;
	cohortId: string;
	classId: string | null;
	attendanceDate: string | null;
	status: "attended" | "not_attended" | "unset";
	notes: string | null;
	homeworkCompleted: boolean;
	markedBy: string | null;
	markedAt: string | null;
	student?: {
		id: string;
		full_name: string;
		email?: string;
	};
	class?: {
		id: string;
		start_time: string;
		end_time: string;
		status?: string;
	};
}

interface CohortAttendanceProps {
	cohortId: string;
	initialClassId?: string;
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

export function CohortAttendance({
	cohortId,
	initialClassId,
}: CohortAttendanceProps) {
	const [records, setRecords] = useState<AttendanceRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState<string | null>(null);
	const [updatingTo, setUpdatingTo] = useState<{
		recordId: string;
		status?: string;
	} | null>(null);
	const [filter, setFilter] = useState<
		"all" | "attended" | "not_attended" | "unset"
	>("all");
	const [notesDialog, setNotesDialog] = useState<{
		open: boolean;
		recordId: string | null;
		currentNotes: string;
	}>({ open: false, recordId: null, currentNotes: "" });
	const [noteValue, setNoteValue] = useState("");
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [selectedClassId, setSelectedClassId] = useState<string>("");
	const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
	const [classes, setClasses] = useState<any[]>([]);
	const [creatingAttendance, setCreatingAttendance] = useState(false);
	const [expandedClasses, setExpandedClasses] = useState<Set<string>>(
		new Set(),
	);
	const [currentPage, setCurrentPage] = useState(1);
	const recordsPerPage = 10;

	// New UX improvement states
	const [classFilter, setClassFilter] = useState<"last" | "all" | string>(
		initialClassId || "last",
	);
	const [searchQuery, setSearchQuery] = useState("");

	// Update classFilter when initialClassId prop changes
	useEffect(() => {
		if (initialClassId !== undefined) {
			const newFilter = initialClassId || "last";
			if (newFilter !== classFilter) {
				setClassFilter(newFilter);
			}
		}
	}, [initialClassId]);

	// Fetch attendance data
	const fetchAttendance = async () => {
		try {
			const response = await fetch(`/api/cohorts/${cohortId}/attendance`);
			if (!response.ok) throw new Error("Failed to fetch attendance");
			const data = await response.json();
			setRecords(data);
		} catch (error) {
			console.error("Error fetching attendance:", error);
			toast.error("Failed to load attendance records");
		} finally {
			setLoading(false);
		}
	};

	const fetchEnrolledStudents = async () => {
		try {
			const response = await fetch(
				`/api/enrollments?cohortId=${cohortId}&limit=100`,
			);
			if (!response.ok) throw new Error("Failed to fetch enrolled students");
			const result = await response.json();
			setEnrolledStudents(result.enrollments || []);
		} catch (error) {
			console.error("Error fetching enrolled students:", error);
		}
	};

	const fetchClasses = async () => {
		try {
			const response = await fetch(`/api/cohorts/${cohortId}/classes`);
			if (!response.ok) throw new Error("Failed to fetch classes");
			const data = await response.json();
			setClasses(data);
		} catch (error) {
			console.error("Error fetching classes:", error);
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			await Promise.all([
				fetchAttendance(),
				fetchEnrolledStudents(),
				fetchClasses(),
			]);
		};
		fetchData();
	}, [cohortId]);

	// Update attendance status
	const updateAttendance = async (
		recordId: string,
		updates: { status?: string; notes?: string; homeworkCompleted?: boolean },
	) => {
		// Store both the record ID and what we're updating to
		setUpdating(recordId);
		if (updates.status) {
			setUpdatingTo({ recordId, status: updates.status });
		}

		try {
			const response = await fetch(`/api/attendance/${recordId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updates),
			});

			if (!response.ok) {
				throw new Error("Failed to update attendance");
			}

			// Update the local record without changing order
			const updatedRecord = await response.json();
			setRecords((prevRecords) =>
				prevRecords.map((r) =>
					r.id === recordId
						? ({ ...r, ...updates, student: r.student } as AttendanceRecord) // Type assertion to ensure correct type
						: r,
				),
			);

			toast.success("Attendance updated successfully");
		} catch (error) {
			console.error("Error updating attendance:", error);
			toast.error("Failed to update attendance");
		} finally {
			setUpdating(null);
			setUpdatingTo(null);
		}
	};

	// Create attendance records
	const createAttendanceRecords = async () => {
		if (!selectedClassId) {
			toast.error("Please select a class");
			return;
		}

		setCreatingAttendance(true);
		try {
			// Get students who don't have attendance records for this class yet
			const existingAttendance = records.filter(
				(r) => r.classId === selectedClassId,
			);
			const studentsWithAttendance = new Set(
				existingAttendance.map((r) => r.studentId),
			);

			// Only create attendance for students with "paid" or "welcome_package_sent" status
			const eligibleStatuses = ["paid", "welcome_package_sent"];
			const studentsNeedingAttendance = enrolledStudents
				.filter(
					(enrollment) =>
						!studentsWithAttendance.has(enrollment.student_id) &&
						eligibleStatuses.includes(enrollment.status),
				)
				.map((enrollment) => ({
					student_id: enrollment.student_id,
					cohort_id: cohortId,
					class_id: selectedClassId,
					status: "unset",
					homework_completed: false,
				}));

			if (studentsNeedingAttendance.length === 0) {
				// Check if there are any enrolled students without attendance but with wrong status
				const ineligibleStudents = enrolledStudents.filter(
					(enrollment) =>
						!studentsWithAttendance.has(enrollment.student_id) &&
						!eligibleStatuses.includes(enrollment.status),
				);

				if (ineligibleStudents.length > 0) {
					toast.info(
						`${ineligibleStudents.length} students were skipped (only students with 'Paid' or 'Welcome Package Sent' status can have attendance)`,
					);
				} else {
					toast.info(
						"All eligible students already have attendance records for this class",
					);
				}
				return;
			}

			const response = await fetch("/api/attendance/bulk", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ records: studentsNeedingAttendance }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create attendance records");
			}

			// Check how many were skipped
			const totalEligible = enrolledStudents.filter((enrollment) =>
				eligibleStatuses.includes(enrollment.status),
			).length;
			const skippedCount = enrolledStudents.length - totalEligible;

			if (skippedCount > 0) {
				toast.success(
					`Created attendance records for ${studentsNeedingAttendance.length} eligible students (${skippedCount} students skipped due to enrollment status)`,
				);
			} else {
				toast.success(
					`Created attendance records for ${studentsNeedingAttendance.length} students`,
				);
			}
			setCreateDialogOpen(false);
			setSelectedClassId("");
			await fetchAttendance();
		} catch (error: any) {
			console.error("Error creating attendance records:", error);
			toast.error(error.message || "Failed to create attendance records");
		} finally {
			setCreatingAttendance(false);
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

	// Get the last class ID
	const lastClassId = useMemo(() => {
		if (classes.length === 0) return null;
		// Sort classes by start_time descending and get the first one
		const sortedClasses = [...classes].sort((a, b) => {
			const dateA = new Date(a.start_time);
			const dateB = new Date(b.start_time);
			return dateB.getTime() - dateA.getTime();
		});
		return sortedClasses[0]?.id;
	}, [classes]);

	// Filter records with enhanced filtering
	const filteredRecords = useMemo(() => {
		let filtered = records;

		// Status filter
		if (filter !== "all") {
			filtered = filtered.filter((r) => r.status === filter);
		}

		// Class filter
		if (classFilter === "last" && lastClassId) {
			// Show only the last class
			filtered = filtered.filter((record) => record.classId === lastClassId);
		} else if (classFilter !== "all" && classFilter !== "last") {
			// Show specific class
			filtered = filtered.filter((record) => record.classId === classFilter);
		}
		// If classFilter is "all", show all classes

		// Search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter((record) => {
				const studentName = record.student?.full_name?.toLowerCase() || "";
				const studentEmail = record.student?.email?.toLowerCase() || "";
				return studentName.includes(query) || studentEmail.includes(query);
			});
		}

		return filtered;
	}, [records, filter, classFilter, searchQuery, lastClassId]);

	// Group records by class and sort by date (descending)
	const groupedRecords = useMemo(() => {
		const groups = new Map<string, AttendanceRecord[]>();

		filteredRecords.forEach((record) => {
			const classId = record.classId || "no-class";
			if (!groups.has(classId)) {
				groups.set(classId, []);
			}
			groups.get(classId)!.push(record);
		});

		// Sort records within each group by student name (stable sort)
		groups.forEach((records, classId) => {
			records.sort((a, b) => {
				const nameA = a.student?.full_name || "";
				const nameB = b.student?.full_name || "";
				return nameA.localeCompare(nameB);
			});
		});

		// Helper function to get a reliable timestamp for a group
		const getGroupTimestamp = (
			classId: string,
			records: AttendanceRecord[],
		): number => {
			// First try to find the class by ID in the classes array
			const classData = classes.find((c) => c.id === classId);
			if (classData?.start_time) {
				const timestamp = new Date(classData.start_time).getTime();
				if (!isNaN(timestamp)) return timestamp;
			}

			// Fall back to the first record's class start_time
			const firstRecord = records[0];
			if (firstRecord?.class?.start_time) {
				const timestamp = new Date(firstRecord.class.start_time).getTime();
				if (!isNaN(timestamp)) return timestamp;
			}

			// Fall back to attendanceDate
			if (firstRecord?.attendanceDate) {
				const timestamp = new Date(firstRecord.attendanceDate).getTime();
				if (!isNaN(timestamp)) return timestamp;
			}

			// Default to 0 for consistent ordering
			return 0;
		};

		// Sort groups by class date (descending)
		const sortedGroups = Array.from(groups.entries()).sort((a, b) => {
			const timestampA = getGroupTimestamp(a[0], a[1]);
			const timestampB = getGroupTimestamp(b[0], b[1]);
			return timestampB - timestampA; // Descending order
		});

		return sortedGroups;
	}, [filteredRecords, classes]);

	// Pagination
	const totalPages = Math.ceil(groupedRecords.length / recordsPerPage);
	const paginatedGroups = groupedRecords.slice(
		(currentPage - 1) * recordsPerPage,
		currentPage * recordsPerPage,
	);

	// Toggle expanded state for a class
	const toggleClass = (classId: string) => {
		const newExpanded = new Set(expandedClasses);
		if (newExpanded.has(classId)) {
			newExpanded.delete(classId);
		} else {
			newExpanded.add(classId);
		}
		setExpandedClasses(newExpanded);
	};

	// Expand only first 3 classes by default when data loads or filters change
	useEffect(() => {
		const firstThreeClassIds = new Set(
			groupedRecords.slice(0, 3).map(([classId]) => classId),
		);
		setExpandedClasses(firstThreeClassIds);
		setCurrentPage(1); // Reset to first page when filters change
	}, [groupedRecords.length]); // Only re-run when the length changes

	// Filter classes that don't have full attendance records yet
	const availableClasses = classes.filter((cls) => {
		const classAttendance = records.filter((r) => r.classId === cls.id);
		return classAttendance.length < enrolledStudents.length;
	});

	if (loading) {
		return (
			<div className="space-y-4">
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

	if (records.length === 0 && classes.length === 0) {
		return (
			<div className="rounded-lg border p-8 text-center">
				<Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
				<p className="mb-1 font-medium text-muted-foreground text-sm">
					No classes scheduled yet
				</p>
				<p className="text-muted-foreground text-xs">
					Create classes first before tracking attendance
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Enhanced Controls */}
			<div className="space-y-3">
				{/* Primary Controls Row */}
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						{/* Class Selector */}
						<Select value={classFilter} onValueChange={setClassFilter}>
							<SelectTrigger className="h-9 w-[220px]">
								<SelectValue placeholder="Select class..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="last">
									<div className="flex items-center gap-2">
										<Clock className="h-3.5 w-3.5" />
										<span>Last Class</span>
										{lastClassId &&
											classes.find((c) => c.id === lastClassId) && (
												<span className="ml-1 text-muted-foreground text-xs">
													(
													{format(
														new Date(
															classes.find((c) => c.id === lastClassId)!
																.start_time,
														),
														"MMM d",
													)}
													)
												</span>
											)}
									</div>
								</SelectItem>
								<SelectItem value="all">
									<div className="flex items-center gap-2">
										<Calendar className="h-3.5 w-3.5" />
										<span>All Classes</span>
									</div>
								</SelectItem>
								{classes.length > 0 && (
									<>
										<div className="border-t px-2 py-1.5 font-medium text-muted-foreground text-xs">
											Select specific class
										</div>
										{classes
											.sort(
												(a, b) =>
													new Date(b.start_time).getTime() -
													new Date(a.start_time).getTime(),
											)
											.map((cls) => (
												<SelectItem key={cls.id} value={cls.id}>
													<div className="flex w-full items-center justify-between">
														<span>
															{format(new Date(cls.start_time), "MMM d, yyyy")}
														</span>
														<span className="ml-2 text-muted-foreground text-xs">
															{format(new Date(cls.start_time), "h:mm a")}
														</span>
													</div>
												</SelectItem>
											))}
									</>
								)}
							</SelectContent>
						</Select>

						{/* Search */}
						<div className="relative">
							<Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search students..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="h-9 w-[200px] pl-8"
							/>
						</div>

						{/* Status Filter */}
						<Select
							value={filter}
							onValueChange={(value: any) => setFilter(value)}
						>
							<SelectTrigger className="h-9 w-[180px]">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value="attended">Present Only</SelectItem>
								<SelectItem value="not_attended">Absent Only</SelectItem>
								<SelectItem value="unset">Not Marked</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{availableClasses.length > 0 && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCreateDialogOpen(true)}
						>
							<Plus className="mr-2 h-4 w-4" />
							Create Attendance
						</Button>
					)}
				</div>

				{/* Summary Stats */}
				<div className="flex items-center gap-6 border-t pt-3 text-sm">
					<div className="text-muted-foreground">
						Showing {filteredRecords.length} of {records.length} records
					</div>
					<div className="flex items-center gap-4">
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
			</div>

			{/* Grouped Attendance Tables by Class */}
			<div className="space-y-4">
				{paginatedGroups.length === 0 ? (
					<div className="rounded-lg border p-8 text-center">
						{records.length === 0 ? (
							<div className="flex flex-col items-center">
								<UserPlus className="mb-3 h-12 w-12 text-muted-foreground/30" />
								<p className="mb-1 font-medium text-muted-foreground text-sm">
									No attendance records yet
								</p>
								<p className="mb-4 text-muted-foreground text-xs">
									Create attendance records for your scheduled classes
								</p>
								{availableClasses.length > 0 && (
									<Button size="sm" onClick={() => setCreateDialogOpen(true)}>
										<Plus className="mr-2 h-4 w-4" />
										Create Attendance Records
									</Button>
								)}
							</div>
						) : filteredRecords.length === 0 ? (
							<div className="flex flex-col items-center">
								<Search className="mb-3 h-12 w-12 text-muted-foreground/30" />
								<p className="mb-1 font-medium text-muted-foreground text-sm">
									No matching records found
								</p>
								<p className="mb-4 text-muted-foreground text-xs">
									{searchQuery && `No students found matching "${searchQuery}"`}
									{!searchQuery &&
										classFilter === "last" &&
										"No attendance records for the last class"}
									{!searchQuery &&
										classFilter !== "all" &&
										classFilter !== "last" &&
										"No attendance records for this class"}
									{!searchQuery &&
										filter !== "all" &&
										`No ${filter.replace("_", " ")} records`}
								</p>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setSearchQuery("");
										setFilter("all");
										setClassFilter("all");
									}}
								>
									Clear Filters
								</Button>
							</div>
						) : (
							<p className="text-muted-foreground">
								No attendance records found for the selected filters
							</p>
						)}
					</div>
				) : (
					paginatedGroups.map(([classId, classRecords]) => {
						const firstRecord = classRecords[0];
						const classDate =
							firstRecord?.class?.start_time || firstRecord?.attendanceDate;
						const isExpanded = expandedClasses.has(classId);

						// Calculate stats for this class
						const classStats = {
							present: classRecords.filter((r) => r.status === "attended")
								.length,
							absent: classRecords.filter((r) => r.status === "not_attended")
								.length,
							unset: classRecords.filter((r) => r.status === "unset").length,
							total: classRecords.length,
						};

						return (
							<Collapsible
								key={classId}
								open={isExpanded}
								onOpenChange={() => toggleClass(classId)}
							>
								<div className="overflow-hidden rounded-lg border">
									{/* Class Header */}
									<CollapsibleTrigger className="w-full">
										<div className="flex items-center justify-between bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/40">
											<div className="flex items-center gap-3">
												<ChevronDown
													className={cn(
														"h-4 w-4 transition-transform",
														!isExpanded && "-rotate-90",
													)}
												/>
												<Calendar className="h-4 w-4 text-muted-foreground" />
												<div className="text-left">
													<span className="font-medium">
														{classDate
															? format(new Date(classDate), "MMMM d, yyyy")
															: "Unknown Date"}
													</span>
													{firstRecord?.class?.start_time && (
														<span className="ml-2 text-muted-foreground text-sm">
															at{" "}
															{format(
																new Date(firstRecord.class.start_time),
																"h:mm a",
															)}
														</span>
													)}
												</div>
											</div>
											<div className="flex items-center gap-4 text-sm">
												<span className="text-muted-foreground">
													{classStats.total} students
												</span>
												<Badge variant="outline" className="gap-1">
													<CheckCircle className="h-3 w-3 text-green-600" />
													{classStats.present} Present
												</Badge>
												<Badge variant="outline" className="gap-1">
													<XCircle className="h-3 w-3 text-red-600" />
													{classStats.absent} Absent
												</Badge>
												{classStats.unset > 0 && (
													<Badge variant="outline" className="gap-1">
														<MinusCircle className="h-3 w-3 text-gray-400" />
														{classStats.unset} Not Marked
													</Badge>
												)}
											</div>
										</div>
									</CollapsibleTrigger>

									{/* Class Attendance Table */}
									<CollapsibleContent>
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead className="w-[200px]">Student</TableHead>
													<TableHead className="w-[100px]">Status</TableHead>
													<TableHead className="w-[120px]">Homework</TableHead>
													<TableHead className="min-w-[200px]">Notes</TableHead>
													<TableHead className="w-[180px]">Actions</TableHead>
													<TableHead className="w-[100px]">Marked</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{classRecords.map((record) => {
													const isUpdating = updating === record.id;
													const config =
														statusConfig[
															record.status as keyof typeof statusConfig
														];

													return (
														<TableRow
															key={record.id}
															className="hover:bg-muted/5"
														>
															{/* Student */}
															<TableCell>
																<Link
																	href={`/admin/students/${record.studentId}`}
																	className="flex items-center gap-2 transition-colors hover:text-primary"
																>
																	<User className="h-3.5 w-3.5 text-muted-foreground" />
																	<div>
																		<div className="font-medium text-sm hover:underline">
																			{record.student?.full_name || "Unknown"}
																		</div>
																		{record.student?.email && (
																			<div className="text-muted-foreground text-xs">
																				{record.student.email}
																			</div>
																		)}
																	</div>
																</Link>
															</TableCell>

															{/* Status */}
															<TableCell>
																<Badge
																	variant="outline"
																	className={cn("text-xs", config.textColor)}
																>
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
																				updateAttendance(record.id, {
																					homeworkCompleted: checked as boolean,
																				});
																			}}
																			disabled={isUpdating}
																			className="h-4 w-4"
																		/>
																		<label
																			htmlFor={`homework-${record.id}`}
																			className={cn(
																				"flex cursor-pointer items-center gap-1 text-xs",
																				record.homeworkCompleted
																					? "text-blue-600"
																					: "text-muted-foreground",
																			)}
																		>
																			<BookOpen className="h-3 w-3" />
																			{record.homeworkCompleted
																				? "Done"
																				: "Pending"}
																		</label>
																		{isUpdating && (
																			<div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
																		)}
																	</div>
																) : (
																	<span className="text-muted-foreground text-xs">
																		—
																	</span>
																)}
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

															{/* Action Buttons */}
															<TableCell>
																<div className="flex items-center gap-1">
																	<Button
																		variant={
																			record.status === "attended"
																				? "default"
																				: "outline"
																		}
																		size="sm"
																		className="h-7 px-2"
																		onClick={() =>
																			updateAttendance(record.id, {
																				status: "attended",
																			})
																		}
																		disabled={isUpdating}
																		title="Mark as Present"
																	>
																		{isUpdating &&
																		updatingTo?.recordId === record.id &&
																		updatingTo?.status === "attended" ? (
																			<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
																		) : (
																			<CheckCircle className="h-3.5 w-3.5" />
																		)}
																	</Button>
																	<Button
																		variant={
																			record.status === "not_attended"
																				? "destructive"
																				: "outline"
																		}
																		size="sm"
																		className="h-7 px-2"
																		onClick={() =>
																			updateAttendance(record.id, {
																				status: "not_attended",
																			})
																		}
																		disabled={isUpdating}
																		title="Mark as Absent"
																	>
																		{isUpdating &&
																		updatingTo?.recordId === record.id &&
																		updatingTo?.status === "not_attended" ? (
																			<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
																		) : (
																			<XCircle className="h-3.5 w-3.5" />
																		)}
																	</Button>
																	<Button
																		variant={
																			record.status === "unset"
																				? "secondary"
																				: "outline"
																		}
																		size="sm"
																		className="h-7 px-2"
																		onClick={() =>
																			updateAttendance(record.id, {
																				status: "unset",
																			})
																		}
																		disabled={isUpdating}
																		title="Clear Status"
																	>
																		{isUpdating &&
																		updatingTo?.recordId === record.id &&
																		updatingTo?.status === "unset" ? (
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
																	<div className="text-muted-foreground text-xs">
																		{format(new Date(record.markedAt), "MMM d")}
																	</div>
																) : (
																	<span className="text-muted-foreground text-xs">
																		—
																	</span>
																)}
															</TableCell>
														</TableRow>
													);
												})}
											</TableBody>
										</Table>
									</CollapsibleContent>
								</div>
							</Collapsible>
						);
					})
				)}
			</div>

			{/* Pagination - only show when filtering all classes or when there are multiple pages */}
			{totalPages > 1 && (classFilter === "all" || classFilter === "last") && (
				<div className="flex items-center justify-between">
					<p className="text-muted-foreground text-sm">
						Showing {(currentPage - 1) * recordsPerPage + 1} to{" "}
						{Math.min(currentPage * recordsPerPage, groupedRecords.length)} of{" "}
						{groupedRecords.length} classes
					</p>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
							disabled={currentPage === 1}
						>
							<ChevronLeft className="h-4 w-4" />
							Previous
						</Button>
						<div className="flex items-center gap-1">
							{Array.from({ length: totalPages }, (_, i) => i + 1).map(
								(page) => (
									<Button
										key={page}
										variant={page === currentPage ? "default" : "outline"}
										size="sm"
										className="h-8 w-8 p-0"
										onClick={() => setCurrentPage(page)}
									>
										{page}
									</Button>
								),
							)}
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setCurrentPage(Math.min(totalPages, currentPage + 1))
							}
							disabled={currentPage === totalPages}
						>
							Next
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}

			{/* Create Attendance Dialog */}
			<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create Attendance Records</DialogTitle>
						<DialogDescription>
							Select a class to create attendance records for all enrolled
							students.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<label htmlFor="select-class" className="font-medium text-sm">
								Select Class
							</label>
							<Select
								value={selectedClassId}
								onValueChange={setSelectedClassId}
							>
								<SelectTrigger aria-labelledby="create-class-label">
									<SelectValue placeholder="Choose a class..." />
								</SelectTrigger>
								<SelectContent>
									{availableClasses.map((cls) => (
										<SelectItem key={cls.id} value={cls.id}>
											{format(
												new Date(cls.start_time),
												"MMM d, yyyy 'at' h:mm a",
											)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="rounded-lg bg-muted p-3">
							{(() => {
								const eligibleCount = enrolledStudents.filter((e) =>
									["paid", "welcome_package_sent"].includes(e.status),
								).length;
								const totalCount = enrolledStudents.length;
								const ineligibleCount = totalCount - eligibleCount;

								if (eligibleCount === 0) {
									return (
										<p className="text-amber-600 text-sm">
											<strong>No eligible students found.</strong> All{" "}
											{totalCount} enrolled student{totalCount !== 1 ? "s" : ""}
											{totalCount === 1 ? " has" : " have"} a status that
											doesn't allow attendance tracking. Only students with
											'Paid' or 'Welcome Package Sent' status can have
											attendance.
										</p>
									);
								}

								return (
									<p className="text-muted-foreground text-sm">
										This will create attendance records for{" "}
										<strong>
											{eligibleCount} eligible student
											{eligibleCount !== 1 ? "s" : ""}
										</strong>{" "}
										in this cohort
										{ineligibleCount > 0 && (
											<span>
												{" "}
												({ineligibleCount} student
												{ineligibleCount !== 1 ? "s" : ""} will be skipped due
												to enrollment status)
											</span>
										)}
										.
									</p>
								);
							})()}
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setCreateDialogOpen(false);
								setSelectedClassId("");
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={createAttendanceRecords}
							disabled={
								!selectedClassId ||
								creatingAttendance ||
								enrolledStudents.filter((e) =>
									["paid", "welcome_package_sent"].includes(e.status),
								).length === 0
							}
						>
							{creatingAttendance ? (
								<>
									<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
									Creating...
								</>
							) : (
								<>
									<UserPlus className="mr-2 h-4 w-4" />
									Create Records
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Notes Dialog - EXACT SAME AS STUDENT ATTENDANCE */}
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
