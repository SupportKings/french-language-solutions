"use client";

import { useEffect, useMemo, useState } from "react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { ClassCreateModal } from "@/features/classes/components/ClassCreateModal";
import { ClassDetailsModal } from "@/features/classes/components/ClassDetailsModal";

import { format } from "date-fns";
import {
	Calendar,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Clock,
	Edit2,
	FileText,
	MoreVertical,
	Plus,
	Trash2,
	Users,
} from "lucide-react";
import { toast } from "sonner";

interface CohortClassesProps {
	cohortId: string;
	cohortFormat?: string;
	cohortRoom?: string;
	onViewAttendance?: (classId: string) => void;
	canCreateClasses?: boolean;
}

export function CohortClasses({
	cohortId,
	cohortFormat = "group",
	cohortRoom,
	onViewAttendance,
	canCreateClasses = true,
}: CohortClassesProps) {
	const [classes, setClasses] = useState<any[]>([]);
	const [loadingClasses, setLoadingClasses] = useState(false);
	const [selectedClass, setSelectedClass] = useState<any>(null);
	const [classModalOpen, setClassModalOpen] = useState(false);
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [classToDelete, setClassToDelete] = useState<any>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [notesDialogOpen, setNotesDialogOpen] = useState(false);
	const [selectedNotes, setSelectedNotes] = useState<{
		date: string;
		notes: string;
	} | null>(null);

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const classesPerPage = 10;

	// Fetch classes
	useEffect(() => {
		async function fetchClasses() {
			if (!cohortId) return;

			setLoadingClasses(true);
			try {
				const response = await fetch(`/api/cohorts/${cohortId}/classes`);
				if (response.ok) {
					const result = await response.json();
					// Sort classes by start_time descending (newest first)
					const sortedClasses = (result || []).sort((a: any, b: any) => {
						const dateA = new Date(a.start_time);
						const dateB = new Date(b.start_time);
						return dateB.getTime() - dateA.getTime();
					});
					setClasses(sortedClasses);
				}
			} catch (error) {
				console.error("Error fetching classes:", error);
			} finally {
				setLoadingClasses(false);
			}
		}
		fetchClasses();
	}, [cohortId]);

	// Handle class click
	const handleClassClick = (classItem: any) => {
		setSelectedClass(classItem);
		setClassModalOpen(true);
	};

	// Handle class update from modal
	const handleClassUpdate = (updatedClass: any) => {
		setClasses((prevClasses) => {
			// Update the class and merge cohort data, letting new cohort fields override old ones
			const updated = prevClasses.map((c) => {
				if (c.id === updatedClass.id) {
					// Merge cohort: new fields from updatedClass override old fields from c
					const mergedCohort = updatedClass.cohort
						? { ...c.cohort, ...updatedClass.cohort }
						: c.cohort;
					return { ...updatedClass, cohort: mergedCohort };
				}
				return c;
			});
			return updated.sort((a, b) => {
				const dateA = new Date(a.start_time);
				const dateB = new Date(b.start_time);
				return dateB.getTime() - dateA.getTime();
			});
		});
		// Also update selectedClass with merged cohort data
		if (selectedClass?.id === updatedClass.id) {
			const mergedCohort = updatedClass.cohort
				? { ...selectedClass.cohort, ...updatedClass.cohort }
				: selectedClass.cohort;
			setSelectedClass({ ...updatedClass, cohort: mergedCohort });
		}
	};

	// Handle view attendance for a class
	const handleViewAttendance = (e: React.MouseEvent, classId: string) => {
		e.stopPropagation();
		if (onViewAttendance) {
			onViewAttendance(classId);
		}
	};

	// Handle create class
	const handleCreateClass = () => {
		setCreateModalOpen(true);
	};

	// Handle class created successfully
	const handleClassCreated = (newClass: any) => {
		// Add the new class to the list and re-sort
		setClasses((prevClasses) => {
			const updatedClasses = [...prevClasses, newClass];
			return updatedClasses.sort((a, b) => {
				const dateA = new Date(a.start_time);
				const dateB = new Date(b.start_time);
				return dateB.getTime() - dateA.getTime();
			});
		});
		// Reset to first page to show the new class
		setCurrentPage(1);
	};

	// Handle delete class
	const handleDeleteClass = async () => {
		if (!classToDelete) return;

		setIsDeleting(true);
		try {
			const response = await fetch(`/api/classes/${classToDelete.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete class");
			}

			// Remove the class from the list
			setClasses((prevClasses) =>
				prevClasses.filter((c) => c.id !== classToDelete.id),
			);

			toast.success("Class deleted successfully");
			setDeleteDialogOpen(false);
			setClassToDelete(null);
		} catch (error) {
			console.error("Error deleting class:", error);
			toast.error("Failed to delete class");
		} finally {
			setIsDeleting(false);
		}
	};

	// Open delete dialog
	const openDeleteDialog = (e: React.MouseEvent, classItem: any) => {
		e.stopPropagation();
		setClassToDelete(classItem);
		setDeleteDialogOpen(true);
	};

	// Format time helper
	const formatTime = (time: string) => {
		if (!time) return "";
		// Remove seconds if present (HH:MM:SS -> HH:MM)
		return time.substring(0, 5);
	};

	// Calculate paginated classes
	const paginatedClasses = useMemo(() => {
		const startIndex = (currentPage - 1) * classesPerPage;
		const endIndex = startIndex + classesPerPage;
		return classes.slice(startIndex, endIndex);
	}, [classes, currentPage, classesPerPage]);

	// Calculate total pages
	const totalPages = Math.ceil(classes.length / classesPerPage);

	// Handle page change
	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	return (
		<>
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="font-semibold text-lg">
						Classes{" "}
						{classes.length > 0 && (
							<span className="font-normal text-muted-foreground">
								({classes.length})
							</span>
						)}
					</h2>
					{canCreateClasses && (
						<Button variant="outline" size="sm" onClick={handleCreateClass}>
							<Plus className="mr-2 h-4 w-4" />
							Create Class
						</Button>
					)}
				</div>

				<div className="space-y-4">
					{loadingClasses ? (
						<div className="grid gap-2">
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className="group relative animate-pulse overflow-hidden rounded-lg border bg-card"
								>
									<div className="p-3">
										<div className="flex items-start justify-between gap-3">
											<div className="flex min-w-0 flex-1 items-start gap-3">
												<div className="h-9 w-9 flex-shrink-0 rounded-full bg-muted" />
												<div className="min-w-0 flex-1">
													<div className="space-y-2">
														<div className="h-4 w-32 rounded bg-muted" />
														<div className="flex items-center gap-3">
															<div className="h-3 w-40 rounded bg-muted" />
															<div className="h-3 w-24 rounded bg-muted" />
														</div>
														<div className="mt-2 flex items-center justify-between">
															<div className="flex items-center gap-2">
																<div className="h-5 w-20 rounded bg-muted" />
																<div className="h-4 w-16 rounded bg-muted" />
															</div>
															<div className="h-7 w-16 rounded bg-muted" />
														</div>
													</div>
												</div>
												<div className="h-8 w-8 rounded bg-muted" />
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					) : classes.length === 0 ? (
						<div className="rounded-lg bg-muted/30 py-8 text-center">
							<Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
							<p className="mb-4 text-muted-foreground">
								No classes scheduled yet
							</p>
							<Button variant="outline" size="sm" onClick={handleCreateClass}>
								<Plus className="mr-2 h-4 w-4" />
								Create First Class
							</Button>
						</div>
					) : (
						<>
							<div className="overflow-hidden rounded-lg border">
								<Table>
									<TableHeader>
										<TableRow className="bg-muted/30">
											<TableHead className="w-[150px]">Date</TableHead>
											<TableHead className="w-[120px]">Time</TableHead>
											<TableHead className="w-[100px]">Duration</TableHead>
											<TableHead className="w-[150px]">Teacher</TableHead>
											<TableHead className="w-[100px]">Status</TableHead>
											<TableHead className="w-[120px]">Attendance</TableHead>
											<TableHead className="w-[200px]">
												Internal Notes
											</TableHead>
											<TableHead className="w-[80px] text-right">
												Actions
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{paginatedClasses.map((classItem) => {
											const classDate = new Date(classItem.start_time);
											const startTime = new Date(classItem.start_time);
											const endTime = new Date(classItem.end_time);
											const statusColors = {
												scheduled:
													"bg-blue-500/10 text-blue-700 border-blue-200",
												in_progress:
													"bg-yellow-500/10 text-yellow-700 border-yellow-200",
												completed:
													"bg-green-500/10 text-green-700 border-green-200",
												cancelled: "bg-red-500/10 text-red-700 border-red-200",
											};
											const statusColor =
												statusColors[
													classItem.status as keyof typeof statusColors
												] || "bg-gray-500/10 text-gray-700 border-gray-200";

											// Calculate duration
											const duration = (() => {
												const start = classItem.start_time
													.split("T")[1]
													?.split(":");
												const end = classItem.end_time
													.split("T")[1]
													?.split(":");
												if (start && end) {
													const startMinutes =
														Number.parseInt(start[0]) * 60 +
														Number.parseInt(start[1]);
													const endMinutes =
														Number.parseInt(end[0]) * 60 +
														Number.parseInt(end[1]);
													const diff = endMinutes - startMinutes;
													const hours = Math.floor(diff / 60);
													const minutes = diff % 60;
													return hours > 0
														? `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`
														: `${minutes}m`;
												}
												return "";
											})();

											return (
												<TableRow
													key={classItem.id}
													className="cursor-pointer hover:bg-muted/5"
													onClick={() => handleClassClick(classItem)}
												>
													{/* Date */}
													<TableCell>
														<div className="flex items-center gap-2">
															<Calendar className="h-4 w-4 text-muted-foreground" />
															<div>
																<div className="font-medium text-sm">
																	{format(classDate, "MMM d, yyyy")}
																</div>
																<div className="text-muted-foreground text-xs">
																	{format(classDate, "EEEE")}
																</div>
															</div>
														</div>
													</TableCell>

													{/* Time */}
													<TableCell>
														<div className="flex items-center gap-1">
															<Clock className="h-3.5 w-3.5 text-muted-foreground" />
															<span className="text-sm">
																{format(startTime, "h:mm a")}
															</span>
														</div>
													</TableCell>

													{/* Duration */}
													<TableCell>
														<span className="text-muted-foreground text-sm">
															{duration}
														</span>
													</TableCell>

													{/* Teacher */}
													<TableCell>
														{classItem.teachers ? (
															<div className="flex items-center gap-2">
																<Users className="h-3.5 w-3.5 text-muted-foreground" />
																<span className="text-sm">
																	{classItem.teachers.first_name}{" "}
																	{classItem.teachers.last_name}
																</span>
															</div>
														) : (
															<span className="text-muted-foreground text-sm">
																—
															</span>
														)}
													</TableCell>

													{/* Status */}
													<TableCell>
														<Badge
															variant="outline"
															className={`text-xs ${statusColor}`}
														>
															{classItem.status
																?.replace(/_/g, " ")
																.replace(/\b\w/g, (l: string) =>
																	l.toUpperCase(),
																)}
														</Badge>
													</TableCell>

													{/* Attendance */}
													<TableCell>
														{classItem.attendance_count !== undefined ? (
															<div className="flex items-center gap-1.5">
																<CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
																<span className="text-sm">
																	{classItem.attendance_count} attended
																</span>
															</div>
														) : (
															<span className="text-muted-foreground text-sm">
																—
															</span>
														)}
													</TableCell>

													{/* Internal Notes */}
													<TableCell
														onClick={(e) => {
															e.stopPropagation();
															if (classItem.notes && classItem.notes.trim()) {
																setSelectedNotes({
																	date: format(classDate, "EEEE, MMM d, yyyy"),
																	notes: classItem.notes,
																});
																setNotesDialogOpen(true);
															}
														}}
													>
														{classItem.notes && classItem.notes.trim() ? (
															<button
																type="button"
																className="flex w-full items-center gap-2 text-left transition-colors hover:text-primary"
															>
																<FileText className="h-3.5 w-3.5 flex-shrink-0" />
																<p className="truncate text-sm">
																	{classItem.notes.length > 50
																		? `${classItem.notes.substring(0, 50)}...`
																		: classItem.notes}
																</p>
															</button>
														) : (
															<span className="text-muted-foreground text-sm">
																—
															</span>
														)}
													</TableCell>

													{/* Actions */}
													<TableCell className="text-right">
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button
																	variant="ghost"
																	size="icon"
																	className="h-8 w-8"
																	onClick={(e) => e.stopPropagation()}
																>
																	<MoreVertical className="h-4 w-4" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																<DropdownMenuItem
																	onClick={(e) => {
																		e.stopPropagation();
																		handleClassClick(classItem);
																	}}
																>
																	<Edit2 className="mr-2 h-3.5 w-3.5" />
																	View Details
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={(e) =>
																		handleViewAttendance(e, classItem.id)
																	}
																>
																	<CheckCircle2 className="mr-2 h-3.5 w-3.5" />
																	View Attendance
																</DropdownMenuItem>
																<DropdownMenuSeparator />
																<DropdownMenuItem
																	onClick={(e) =>
																		openDeleteDialog(e, classItem)
																	}
																	className="text-destructive focus:text-destructive"
																>
																	<Trash2 className="mr-2 h-3.5 w-3.5" />
																	Delete Class
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</div>

							{/* Pagination Controls */}
							{totalPages > 1 && (
								<div className="mt-4 flex items-center justify-between">
									<p className="text-muted-foreground text-sm">
										Showing {(currentPage - 1) * classesPerPage + 1} to{" "}
										{Math.min(currentPage * classesPerPage, classes.length)} of{" "}
										{classes.length} classes
									</p>
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												handlePageChange(Math.max(1, currentPage - 1))
											}
											disabled={currentPage === 1}
										>
											<ChevronLeft className="h-4 w-4" />
											Previous
										</Button>

										{/* Page number buttons */}
										<div className="flex items-center gap-1">
											{(() => {
												const pageNumbers = [];
												const maxVisiblePages = 5;
												let startPage = Math.max(
													1,
													currentPage - Math.floor(maxVisiblePages / 2),
												);
												const endPage = Math.min(
													totalPages,
													startPage + maxVisiblePages - 1,
												);

												// Adjust start if we're near the end
												if (endPage === totalPages) {
													startPage = Math.max(
														1,
														endPage - maxVisiblePages + 1,
													);
												}

												// Add first page and ellipsis if needed
												if (startPage > 1) {
													pageNumbers.push(
														<Button
															key={1}
															variant={
																currentPage === 1 ? "default" : "outline"
															}
															size="sm"
															className="h-8 w-8 p-0"
															onClick={() => handlePageChange(1)}
														>
															1
														</Button>,
													);
													if (startPage > 2) {
														pageNumbers.push(
															<span key="ellipsis-start" className="px-1">
																...
															</span>,
														);
													}
												}

												// Add visible page numbers
												for (let i = startPage; i <= endPage; i++) {
													pageNumbers.push(
														<Button
															key={i}
															variant={
																currentPage === i ? "default" : "outline"
															}
															size="sm"
															className="h-8 w-8 p-0"
															onClick={() => handlePageChange(i)}
														>
															{i}
														</Button>,
													);
												}

												// Add last page and ellipsis if needed
												if (endPage < totalPages) {
													if (endPage < totalPages - 1) {
														pageNumbers.push(
															<span key="ellipsis-end" className="px-1">
																...
															</span>,
														);
													}
													pageNumbers.push(
														<Button
															key={totalPages}
															variant={
																currentPage === totalPages
																	? "default"
																	: "outline"
															}
															size="sm"
															className="h-8 w-8 p-0"
															onClick={() => handlePageChange(totalPages)}
														>
															{totalPages}
														</Button>,
													);
												}

												return pageNumbers;
											})()}
										</div>

										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												handlePageChange(Math.min(totalPages, currentPage + 1))
											}
											disabled={currentPage === totalPages}
										>
											Next
											<ChevronRight className="h-4 w-4" />
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</div>

			<ClassDetailsModal
				open={classModalOpen}
				onClose={() => {
					setClassModalOpen(false);
					setSelectedClass(null);
				}}
				classItem={selectedClass}
				onUpdate={handleClassUpdate}
			/>

			<ClassCreateModal
				open={createModalOpen}
				onClose={() => setCreateModalOpen(false)}
				cohortId={cohortId}
				onSuccess={handleClassCreated}
			/>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete this class. This action cannot be
							undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					{classToDelete && (
						<div className="my-4 rounded-lg bg-muted p-3">
							<p className="font-medium text-sm">
								{format(
									new Date(classToDelete.start_time),
									"EEEE, MMMM d, yyyy",
								)}
							</p>
							<p className="text-muted-foreground text-sm">
								{format(new Date(classToDelete.start_time), "h:mm a")} -{" "}
								{format(new Date(classToDelete.end_time), "h:mm a")}
							</p>
							{classToDelete.teachers && (
								<p className="mt-1 text-muted-foreground text-sm">
									Teacher: {classToDelete.teachers.first_name}{" "}
									{classToDelete.teachers.last_name}
								</p>
							)}
						</div>
					)}
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteClass}
							disabled={isDeleting}
							className="bg-destructive hover:bg-destructive/90"
						>
							{isDeleting ? (
								<>
									<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
									Deleting...
								</>
							) : (
								"Delete Class"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Internal Notes Dialog */}
			<Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5 text-primary" />
							Internal Notes
						</DialogTitle>
						{selectedNotes && (
							<DialogDescription>{selectedNotes.date}</DialogDescription>
						)}
					</DialogHeader>
					{selectedNotes && (
						<div className="rounded-lg border bg-muted/30 p-4">
							<p className="whitespace-pre-wrap text-sm leading-relaxed">
								{selectedNotes.notes}
							</p>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
