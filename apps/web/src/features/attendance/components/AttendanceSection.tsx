"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Calendar, Users, Clock, CheckCircle, XCircle, HelpCircle, ArrowUpDown, Plus, UserPlus, Edit2, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { AttendanceEditModal } from "./AttendanceEditModal";

interface AttendanceSectionProps {
	cohortId: string;
}

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
	homeworkCompleted?: boolean;
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

export function AttendanceSection({ cohortId }: AttendanceSectionProps) {
	const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [groupBy, setGroupBy] = useState<"student" | "class">("class");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [selectedClassId, setSelectedClassId] = useState<string>("");
	const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
	const [classes, setClasses] = useState<any[]>([]);
	const [creatingAttendance, setCreatingAttendance] = useState(false);
	const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
	const [editModalOpen, setEditModalOpen] = useState(false);

	useEffect(() => {
		fetchAttendanceRecords();
		fetchEnrolledStudents();
		fetchClasses();
	}, [cohortId]);

	const fetchAttendanceRecords = async () => {
		setLoading(true);
		try {
			const response = await fetch(`/api/cohorts/${cohortId}/attendance`);
			if (!response.ok) throw new Error("Failed to fetch attendance records");
			const data = await response.json();
			setAttendanceRecords(data);
		} catch (error) {
			console.error("Error fetching attendance:", error);
			toast.error("Failed to load attendance records");
		} finally {
			setLoading(false);
		}
	};

	const updateAttendance = async (recordId: string, updates: { status?: string; homeworkCompleted?: boolean }) => {
		try {
			const response = await fetch(`/api/attendance/${recordId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updates),
			});
			if (!response.ok) throw new Error("Failed to update attendance");
			
			const updatedRecord = await response.json();
			setAttendanceRecords(prev => 
				prev.map(record => record.id === recordId ? updatedRecord : record)
			);
			toast.success("Attendance updated");
		} catch (error) {
			console.error("Error updating attendance:", error);
			toast.error("Failed to update attendance");
		}
	};

	const handleEditRecord = (record: AttendanceRecord) => {
		setEditingRecord(record);
		setEditModalOpen(true);
	};

	const handleUpdateRecord = (updatedRecord: AttendanceRecord) => {
		setAttendanceRecords(prev => 
			prev.map(record => record.id === updatedRecord.id ? updatedRecord : record)
		);
	};

	const fetchEnrolledStudents = async () => {
		try {
			const response = await fetch(`/api/enrollments?cohortId=${cohortId}&limit=100`);
			if (response.ok) {
				const result = await response.json();
				setEnrolledStudents(result.enrollments || []);
			}
		} catch (error) {
			console.error("Error fetching enrolled students:", error);
		}
	};

	const fetchClasses = async () => {
		try {
			const response = await fetch(`/api/cohorts/${cohortId}/classes`);
			if (response.ok) {
				const result = await response.json();
				setClasses(result || []);
			}
		} catch (error) {
			console.error("Error fetching classes:", error);
		}
	};

	// Get classes that don't have full attendance records yet
	const getAvailableClassesForAttendance = () => {
		return classes.filter((cls: any) => {
			// Check if this class already has attendance records for all enrolled students
			const classAttendance = attendanceRecords.filter(r => r.classId === cls.id);
			const studentsWithAttendance = new Set(classAttendance.map(r => r.studentId));
			
			// If we have fewer attendance records than enrolled students, this class is available
			return studentsWithAttendance.size < enrolledStudents.length;
		});
	};

	const createAttendanceRecords = async () => {
		if (!selectedClassId) {
			toast.error("Please select a class");
			return;
		}

		setCreatingAttendance(true);
		try {
			const selectedClass = classes.find(c => c.id === selectedClassId);
			if (!selectedClass) throw new Error("Class not found");

			// Get students who don't have attendance records for this class yet
			const existingAttendance = attendanceRecords.filter(r => r.classId === selectedClassId);
			const studentsWithAttendance = new Set(existingAttendance.map(r => r.studentId));
			
			const studentsNeedingAttendance = enrolledStudents.filter(
				enrollment => !studentsWithAttendance.has(enrollment.student_id)
			);

			if (studentsNeedingAttendance.length === 0) {
				toast.info("All students already have attendance records for this class");
				return;
			}

			// Create attendance records for students who don't have them yet
			const attendanceData = studentsNeedingAttendance.map(enrollment => ({
				student_id: enrollment.student_id,
				cohort_id: cohortId,
				class_id: selectedClassId,
				attendance_date: selectedClass.start_time.split('T')[0], // Extract date from start_time
				status: "unset",
			}));

			const response = await fetch(`/api/attendance/bulk`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ records: attendanceData }),
			});

			if (!response.ok) throw new Error("Failed to create attendance records");

			toast.success(`Created attendance records for ${studentsNeedingAttendance.length} students`);
			setCreateDialogOpen(false);
			setSelectedClassId("");
			fetchAttendanceRecords(); // Refresh the list
		} catch (error) {
			console.error("Error creating attendance records:", error);
			toast.error("Failed to create attendance records");
		} finally {
			setCreatingAttendance(false);
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "attended":
				return <CheckCircle className="h-4 w-4 text-green-600" />;
			case "not_attended":
				return <XCircle className="h-4 w-4 text-red-600" />;
			default:
				return <HelpCircle className="h-4 w-4 text-gray-400" />;
		}
	};

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			attended: { label: "Present", className: "bg-green-500/10 text-green-700 border-green-200" },
			not_attended: { label: "Absent", className: "bg-red-500/10 text-red-700 border-red-200" },
			unset: { label: "Not Marked", className: "bg-gray-500/10 text-gray-700 border-gray-200" },
		};
		const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unset;
		
		return (
			<Badge variant="outline" className={`text-xs ${config.className}`}>
				{config.label}
			</Badge>
		);
	};

	// Group records by student or class
	const groupedRecords = attendanceRecords.reduce((acc, record) => {
		const key = groupBy === "student" 
			? record.student?.full_name || "Unknown Student"
			: record.attendanceDate; // Use date as grouping key for classes
		
		if (!acc[key]) {
			acc[key] = [];
		}
		acc[key].push(record);
		return acc;
	}, {} as Record<string, AttendanceRecord[]>);

	// Sort groups
	const sortedGroups = Object.entries(groupedRecords).sort((a, b) => {
		if (groupBy === "class") {
			// Sort by date for class grouping
			const dateA = a[1][0]?.class?.start_time || a[1][0]?.attendanceDate;
			const dateB = b[1][0]?.class?.start_time || b[1][0]?.attendanceDate;
			return sortOrder === "asc" 
				? new Date(dateA).getTime() - new Date(dateB).getTime()
				: new Date(dateB).getTime() - new Date(dateA).getTime();
		} else {
			// Sort alphabetically for student grouping
			return sortOrder === "asc" 
				? a[0].localeCompare(b[0])
				: b[0].localeCompare(a[0]);
		}
	});

	if (loading) {
		return (
			<div className="space-y-4">
				{/* Controls Skeleton */}
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="h-10 w-[180px] bg-muted rounded animate-pulse" />
						<div className="h-9 w-32 bg-muted rounded animate-pulse" />
						<div className="h-9 w-36 bg-muted rounded animate-pulse" />
					</div>
					<div className="flex items-center gap-4">
						<div className="h-4 w-20 bg-muted rounded animate-pulse" />
						<div className="h-4 w-20 bg-muted rounded animate-pulse" />
						<div className="h-4 w-24 bg-muted rounded animate-pulse" />
					</div>
				</div>

				{/* Grouped Records Skeleton */}
				<div className="space-y-4">
					{[1, 2, 3].map((groupIndex) => (
						<div key={groupIndex} className="border rounded-lg overflow-hidden animate-pulse">
							<div className="bg-muted/30 px-4 py-3 border-b">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="h-4 w-4 bg-muted rounded" />
										<div className="h-5 w-32 bg-muted rounded" />
										<div className="h-4 w-40 bg-muted rounded" />
									</div>
									<div className="flex items-center gap-3">
										<div className="h-4 w-24 bg-muted rounded" />
										<div className="h-5 w-20 bg-muted rounded" />
									</div>
								</div>
							</div>
							<div className="divide-y">
								{[1, 2, 3].map((recordIndex) => (
									<div key={recordIndex} className="px-4 py-3">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3 flex-1">
												<div className="h-4 w-4 bg-muted rounded-full" />
												<div className="flex-1">
													<div className="h-4 w-32 bg-muted rounded mb-1" />
													<div className="h-3 w-48 bg-muted rounded" />
												</div>
											</div>
											<div className="flex items-center gap-3">
												<div className="h-3 w-32 bg-muted rounded" />
												<div className="flex items-center gap-1">
													<div className="h-7 w-7 bg-muted rounded" />
													<div className="h-7 w-7 bg-muted rounded" />
													<div className="h-7 w-7 bg-muted rounded" />
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (attendanceRecords.length === 0) {
		return (
			<div className="text-center py-8 bg-muted/30 rounded-lg">
				<Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
				<p className="text-muted-foreground mb-4">No attendance records yet</p>
				<p className="text-sm text-muted-foreground">Attendance records will appear once classes begin</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Controls */}
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<Select value={groupBy} onValueChange={(value: "student" | "class") => setGroupBy(value)}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Group by..." />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="class">Group by Class</SelectItem>
							<SelectItem value="student">Group by Student</SelectItem>
						</SelectContent>
					</Select>
					
					<Button
						variant="outline"
						size="sm"
						onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
					>
						<ArrowUpDown className="h-4 w-4 mr-2" />
						{sortOrder === "asc" ? "Oldest First" : "Newest First"}
					</Button>
					
					<Button
						variant="outline"
						size="sm"
						onClick={() => setCreateDialogOpen(true)}
					>
						<Plus className="h-4 w-4 mr-2" />
						Create Attendance
					</Button>
				</div>

				{/* Summary Stats */}
				<div className="flex items-center gap-4 text-sm">
					<div className="flex items-center gap-2">
						<CheckCircle className="h-4 w-4 text-green-600" />
						<span>{attendanceRecords.filter(r => r.status === "attended").length} Present</span>
					</div>
					<div className="flex items-center gap-2">
						<XCircle className="h-4 w-4 text-red-600" />
						<span>{attendanceRecords.filter(r => r.status === "not_attended").length} Absent</span>
					</div>
					<div className="flex items-center gap-2">
						<HelpCircle className="h-4 w-4 text-gray-400" />
						<span>{attendanceRecords.filter(r => r.status === "unset").length} Not Marked</span>
					</div>
					<div className="flex items-center gap-2">
						<BookOpen className="h-4 w-4 text-blue-600" />
						<span>
							{attendanceRecords.filter(r => r.status === "attended" && r.homeworkCompleted).length}/
							{attendanceRecords.filter(r => r.status === "attended").length} Homework
						</span>
					</div>
				</div>
			</div>

			{/* Grouped Records */}
			<div className="space-y-4">
				{sortedGroups.map(([groupName, records]) => {
					const attendedCount = records.filter(r => r.status === "attended").length;
					const totalCount = records.length;
					const attendanceRate = totalCount > 0 ? (attendedCount / totalCount * 100).toFixed(0) : 0;
					
					return (
						<div key={groupName} className="border rounded-lg overflow-hidden">
							<div className="bg-muted/30 px-4 py-3 border-b">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										{groupBy === "class" ? (
											<Calendar className="h-4 w-4 text-muted-foreground" />
										) : (
											<Users className="h-4 w-4 text-muted-foreground" />
										)}
										<h3 className="font-medium">{groupName}</h3>
										{groupBy === "class" && records[0]?.class && (
											<span className="text-sm text-muted-foreground">
												{format(new Date(records[0].class.start_time), "MMM d, yyyy 'at' h:mm a")}
											</span>
										)}
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
								{records.map((record) => (
									<div 
										key={record.id} 
										className="px-4 py-3 hover:bg-muted/10 transition-colors cursor-pointer group"
										onClick={() => handleEditRecord(record)}
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3 flex-1">
												{getStatusIcon(record.status)}
												<div className="flex-1">
													{groupBy === "class" ? (
														<>
															<span className="font-medium text-sm">
																{record.student?.full_name || "Unknown Student"}
															</span>
															{record.student?.email && (
																<span className="text-xs text-muted-foreground ml-2">
																	{record.student.email}
																</span>
															)}
														</>
													) : (
														<>
															<span className="font-medium text-sm">
																{format(new Date(record.attendanceDate), "MMM d, yyyy")}
															</span>
															{record.class && (
																<span className="text-xs text-muted-foreground ml-2">
																	{format(new Date(record.class.start_time), "h:mm a")}
																</span>
															)}
														</>
													)}
												</div>
											</div>
											
											<div className="flex items-center gap-3">
												{record.notes && (
													<span className="text-xs text-muted-foreground max-w-[200px] truncate">
														{record.notes}
													</span>
												)}

												{record.status === "attended" && (
													<div 
														className={`flex items-center gap-1.5 px-2 py-1 rounded border text-xs transition-all duration-200 cursor-pointer hover:opacity-80 ${
															record.homeworkCompleted 
																? "border-blue-200 bg-blue-50/50 text-blue-700" 
																: "border-gray-200 bg-muted/30 text-muted-foreground hover:bg-muted/50"
														}`}
														onClick={(e) => {
															e.stopPropagation();
															updateAttendance(record.id, { homeworkCompleted: !record.homeworkCompleted });
														}}
														title={record.homeworkCompleted ? "Mark homework as incomplete" : "Mark homework as complete"}
													>
														<BookOpen className="h-3 w-3" />
														<span className="font-medium">
															{record.homeworkCompleted ? "HW Done" : "HW Pending"}
														</span>
														{record.homeworkCompleted && (
															<div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
														)}
													</div>
												)}
												
												{record.markedAt && (
													<div className="text-xs text-muted-foreground">
														Marked {format(new Date(record.markedAt), "MMM d 'at' h:mm a")}
														{record.teacher && (
															<span className="ml-1">
																by {record.teacher.first_name} {record.teacher.last_name}
															</span>
														)}
													</div>
												)}
												
												<div className="flex items-center gap-1">
													<Button
														variant="ghost"
														size="sm"
														className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
														onClick={(e) => {
															e.stopPropagation();
															handleEditRecord(record);
														}}
													>
														<Edit2 className="h-3.5 w-3.5" />
													</Button>
													<Button
														variant={record.status === "attended" ? "default" : "outline"}
														size="sm"
														className="h-7 px-2"
														onClick={(e) => {
															e.stopPropagation();
															updateAttendance(record.id, { status: "attended" });
														}}
													>
														<CheckCircle className="h-3.5 w-3.5" />
													</Button>
													<Button
														variant={record.status === "not_attended" ? "destructive" : "outline"}
														size="sm"
														className="h-7 px-2"
														onClick={(e) => {
															e.stopPropagation();
															updateAttendance(record.id, { status: "not_attended" });
														}}
													>
														<XCircle className="h-3.5 w-3.5" />
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
														>
															<HelpCircle className="h-3.5 w-3.5" />
														</Button>
													)}
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					);
				})}
			</div>

			{/* Create Attendance Dialog */}
			<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create Attendance Records</DialogTitle>
						<DialogDescription>
							Select a class to create attendance records for all enrolled students.
							This will create attendance entries with "Not Marked" status that you can update later.
						</DialogDescription>
					</DialogHeader>
					
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Select Class</label>
							<Select value={selectedClassId} onValueChange={setSelectedClassId}>
								<SelectTrigger>
									<SelectValue placeholder="Choose a class..." />
								</SelectTrigger>
								<SelectContent>
									{getAvailableClassesForAttendance().map((cls) => {
										const classDate = new Date(cls.start_time);
										const existingForClass = attendanceRecords.filter(r => r.classId === cls.id);
										const remainingStudents = enrolledStudents.length - new Set(existingForClass.map(r => r.studentId)).size;
										
										return (
											<SelectItem key={cls.id} value={cls.id}>
												<div className="flex flex-col">
													<span>{format(classDate, "MMM d, yyyy 'at' h:mm a")}</span>
													{remainingStudents < enrolledStudents.length && (
														<span className="text-xs text-muted-foreground">
															{remainingStudents} students need attendance
														</span>
													)}
												</div>
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
						</div>
						
						{selectedClassId && (
							<div className="rounded-lg bg-muted/50 p-3 space-y-2">
								<p className="text-sm font-medium">This will create attendance records for:</p>
								{(() => {
									const existingForClass = attendanceRecords.filter(r => r.classId === selectedClassId);
									const studentsWithAttendance = new Set(existingForClass.map(r => r.studentId));
									const studentsNeedingAttendance = enrolledStudents.filter(
										enrollment => !studentsWithAttendance.has(enrollment.student_id)
									);
									
									return (
										<>
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<Users className="h-4 w-4" />
												<span>{studentsNeedingAttendance.length} students (out of {enrolledStudents.length} total)</span>
											</div>
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<Calendar className="h-4 w-4" />
												<span>
													{(() => {
														const selectedClass = classes.find(c => c.id === selectedClassId);
														return selectedClass ? format(new Date(selectedClass.start_time), "MMM d, yyyy 'at' h:mm a") : "";
													})()}
												</span>
											</div>
										</>
									);
								})()}
							</div>
						)}
						
						{getAvailableClassesForAttendance().length === 0 && (
							<div className="text-center py-4 text-sm text-muted-foreground">
								<p>No classes available for attendance creation.</p>
								<p className="mt-1">Either all classes already have attendance records or there are no scheduled classes.</p>
							</div>
						)}
					</div>
					
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setCreateDialogOpen(false)}
							disabled={creatingAttendance}
						>
							Cancel
						</Button>
						<Button
							onClick={createAttendanceRecords}
							disabled={!selectedClassId || creatingAttendance || getAvailableClassesForAttendance().length === 0}
						>
							{creatingAttendance ? (
								<>Creating...</>
							) : (
								<>
									<UserPlus className="h-4 w-4 mr-2" />
									Create Records
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Attendance Edit Modal */}
			<AttendanceEditModal
				open={editModalOpen}
				onClose={() => {
					setEditModalOpen(false);
					setEditingRecord(null);
				}}
				record={editingRecord}
				onUpdate={handleUpdateRecord}
			/>
		</div>
	);
}