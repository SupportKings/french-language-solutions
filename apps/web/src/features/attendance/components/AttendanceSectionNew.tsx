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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { Calendar, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AttendanceTable } from "./AttendanceTable";

interface AttendanceSectionProps {
	cohortId: string;
}

interface AttendanceRecord {
	id: string;
	studentId: string;
	cohortId: string;
	classId: string | null;
	attendanceDate: string | null;
	status: "unset" | "attended" | "not_attended";
	notes: string | null;
	markedBy: string | null;
	markedAt: string | null;
	homeworkCompleted: boolean;
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
		status?: string;
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
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [selectedClassId, setSelectedClassId] = useState<string>("");
	const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
	const [classes, setClasses] = useState<any[]>([]);
	const [creatingAttendance, setCreatingAttendance] = useState(false);

	useEffect(() => {
		fetchAttendanceRecords();
		fetchEnrolledStudents();
		fetchClasses();
	}, [cohortId]);

	const fetchAttendanceRecords = async () => {
		setLoading(true);
		try {
			const response = await fetch(`/api/cohorts/${cohortId}/attendance`);
			if (!response.ok) {
				throw new Error("Failed to fetch attendance records");
			}
			const data = await response.json();
			setAttendanceRecords(data);
		} catch (error) {
			console.error("Error fetching attendance records:", error);
			toast.error("Failed to load attendance records");
		} finally {
			setLoading(false);
		}
	};

	const fetchEnrolledStudents = async () => {
		try {
			const response = await fetch(`/api/cohorts/${cohortId}/students`);
			if (!response.ok) {
				throw new Error("Failed to fetch enrolled students");
			}
			const data = await response.json();
			setEnrolledStudents(data);
		} catch (error) {
			console.error("Error fetching enrolled students:", error);
		}
	};

	const fetchClasses = async () => {
		try {
			const response = await fetch(`/api/cohorts/${cohortId}/classes`);
			if (!response.ok) {
				throw new Error("Failed to fetch classes");
			}
			const data = await response.json();
			setClasses(data);
		} catch (error) {
			console.error("Error fetching classes:", error);
		}
	};

	const updateAttendance = async (
		recordId: string,
		updates: { status?: string; notes?: string; homeworkCompleted?: boolean },
	) => {
		try {
			const response = await fetch(`/api/attendance/${recordId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updates),
			});

			if (!response.ok) {
				throw new Error("Failed to update attendance");
			}

			// Refresh the attendance records
			await fetchAttendanceRecords();
		} catch (error) {
			console.error("Error updating attendance:", error);
			throw error;
		}
	};

	const createAttendanceRecords = async () => {
		if (!selectedClassId) {
			toast.error("Please select a class");
			return;
		}

		setCreatingAttendance(true);
		try {
			const selectedClass = classes.find((c) => c.id === selectedClassId);
			if (!selectedClass) {
				throw new Error("Selected class not found");
			}

			// Create attendance records for all enrolled students
			const attendanceData = enrolledStudents.map((enrollment) => ({
				student_id: enrollment.student_id,
				cohort_id: cohortId,
				class_id: selectedClassId,
				status: "unset",
				homework_completed: false,
			}));

			const response = await fetch(`/api/attendance/bulk`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ records: attendanceData }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create attendance records");
			}

			toast.success("Attendance records created successfully");
			setCreateDialogOpen(false);
			setSelectedClassId("");
			await fetchAttendanceRecords();
		} catch (error: any) {
			console.error("Error creating attendance records:", error);
			toast.error(error.message || "Failed to create attendance records");
		} finally {
			setCreatingAttendance(false);
		}
	};

	// Filter classes that don't have attendance records yet
	const availableClasses = classes.filter(
		(cls) => !attendanceRecords.some((record) => record.classId === cls.id),
	);

	if (loading) {
		return (
			<div className="space-y-4">
				<div className="grid grid-cols-4 gap-4">
					{[...Array(4)].map((_, i) => (
						<Skeleton key={i} className="h-24 rounded-lg" />
					))}
				</div>
				<Skeleton className="h-[400px] rounded-lg" />
			</div>
		);
	}

	if (attendanceRecords.length === 0 && classes.length === 0) {
		return (
			<div className="rounded-lg border border-dashed p-12 text-center">
				<Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
				<h3 className="mb-2 font-medium text-lg">No Classes Yet</h3>
				<p className="mb-6 text-muted-foreground text-sm">
					Create classes first before tracking attendance
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-lg">Attendance Records</h3>
					<p className="text-muted-foreground text-sm">
						Track and manage student attendance for this cohort
					</p>
				</div>
				{availableClasses.length > 0 && (
					<Button onClick={() => setCreateDialogOpen(true)}>
						<Plus className="mr-2 h-4 w-4" />
						Create Attendance
					</Button>
				)}
			</div>

			{/* Attendance Table */}
			{attendanceRecords.length > 0 ? (
				<AttendanceTable
					records={attendanceRecords}
					onUpdateAttendance={updateAttendance}
					loading={loading}
					showStudent={true}
					readOnly={false}
				/>
			) : (
				<div className="rounded-lg border border-dashed p-12 text-center">
					<UserPlus className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
					<h3 className="mb-2 font-medium text-lg">No Attendance Records</h3>
					<p className="mb-6 text-muted-foreground text-sm">
						{availableClasses.length > 0
							? "Create attendance records for your classes"
							: "All classes have attendance records created"}
					</p>
					{availableClasses.length > 0 && (
						<Button onClick={() => setCreateDialogOpen(true)}>
							<Plus className="mr-2 h-4 w-4" />
							Create Attendance Records
						</Button>
					)}
				</div>
			)}

			{/* Create Attendance Dialog */}
			<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create Attendance Records</DialogTitle>
						<DialogDescription>
							Select a class to create attendance records for all enrolled students.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<label className="font-medium text-sm">Select Class</label>
							<Select value={selectedClassId} onValueChange={setSelectedClassId}>
								<SelectTrigger>
									<SelectValue placeholder="Choose a class..." />
								</SelectTrigger>
								<SelectContent>
									{availableClasses.map((cls) => (
										<SelectItem key={cls.id} value={cls.id}>
											{new Date(cls.start_time).toLocaleDateString()} -{" "}
											{new Date(cls.start_time).toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="rounded-lg bg-muted p-3">
							<p className="text-muted-foreground text-sm">
								This will create attendance records for{" "}
								<strong>{enrolledStudents.length} students</strong> in this cohort.
							</p>
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
							disabled={!selectedClassId || creatingAttendance}
						>
							{creatingAttendance ? "Creating..." : "Create Records"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}