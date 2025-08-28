"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { EditableSection } from "@/components/inline-edit/EditableSection";
import { InlineEditField } from "@/components/inline-edit/InlineEditField";
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AttendanceSection } from "@/features/attendance/components/AttendanceSection";
import { ClassDetailsModal } from "@/features/classes/components/ClassDetailsModal";
import { WeeklySessionModal } from "@/features/cohorts/components/WeeklySessionModal";
import {
	useCohort,
	useCohortWithSessions,
} from "@/features/cohorts/queries/cohorts.queries";
import type { CohortStatus } from "@/features/cohorts/schemas/cohort.schema";

import { format } from "date-fns";
import {
	Activity,
	BarChart3,
	BookOpen,
	Calendar,
	CheckCircle2,
	ChevronRight,
	Clock,
	Edit2,
	ExternalLink,
	FolderOpen,
	GraduationCap,
	Link as LinkIcon,
	Mail,
	MapPin,
	MoreVertical,
	Phone,
	Plus,
	School,
	Trash2,
	UserPlus,
	Users,
	Video,
} from "lucide-react";
import { toast } from "sonner";

interface CohortDetailPageClientProps {
	cohortId: string;
}

// Status options
const statusOptions = [
	{ value: "enrollment_open", label: "Enrollment Open" },
	{ value: "enrollment_closed", label: "Enrollment Closed" },
	{ value: "class_ended", label: "Class Ended" },
];

// Room type options
const roomTypeOptions = [
	{ value: "for_one_to_one", label: "One-to-One" },
	{ value: "medium", label: "Medium" },
	{ value: "medium_plus", label: "Medium Plus" },
	{ value: "large", label: "Large" },
];

// Language level options
const levelOptions = [
	{ value: "a1", label: "A1" },
	{ value: "a1_plus", label: "A1+" },
	{ value: "a2", label: "A2" },
	{ value: "a2_plus", label: "A2+" },
	{ value: "b1", label: "B1" },
	{ value: "b1_plus", label: "B1+" },
	{ value: "b2", label: "B2" },
	{ value: "b2_plus", label: "B2+" },
	{ value: "c1", label: "C1" },
	{ value: "c1_plus", label: "C1+" },
	{ value: "c2", label: "C2" },
];

// Status badge variant mapping
const getStatusVariant = (status: CohortStatus) => {
	switch (status) {
		case "enrollment_open":
			return "success";
		case "enrollment_closed":
			return "warning";
		case "class_ended":
			return "secondary";
		default:
			return "outline";
	}
};

// Format level for display
const formatLevel = (level: string | null) => {
	if (!level) return "Not set";
	return level.replace("_", "+").toUpperCase();
};

// Format status for display
const formatStatus = (status: CohortStatus) => {
	return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

// Format room type for display
const formatRoomType = (roomType: string | null) => {
	if (!roomType) return "Not set";
	return roomType
		.replace("for_one_to_one", "One-to-One")
		.replace(/_/g, " ")
		.replace(/\b\w/g, (l) => l.toUpperCase());
};

// Format time to HH:MM
const formatTime = (time: string) => {
	if (!time) return "";
	// Remove seconds if present (HH:MM:SS -> HH:MM)
	return time.substring(0, 5);
};

export function CohortDetailPageClient({
	cohortId,
}: CohortDetailPageClientProps) {
	const router = useRouter();
	const { data: cohortData, isLoading, error, isSuccess } = useCohort(cohortId);
	const { data: cohortWithSessions } = useCohortWithSessions(cohortId);
	const [cohort, setCohort] = useState<any>(null);
	const [weeklySessionModalOpen, setWeeklySessionModalOpen] = useState(false);
	const [sessionToEdit, setSessionToEdit] = useState<any>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isFinalizing, setIsFinalizing] = useState(false);
	const [products, setProducts] = useState<any[]>([]);
	const [loadingProducts, setLoadingProducts] = useState(false);
	const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
	const [loadingStudents, setLoadingStudents] = useState(false);
	const [classes, setClasses] = useState<any[]>([]);
	const [loadingClasses, setLoadingClasses] = useState(false);
	const [selectedClass, setSelectedClass] = useState<any>(null);
	const [classModalOpen, setClassModalOpen] = useState(false);

	// Update the cohort when data changes
	useEffect(() => {
		if (cohortData) {
			setCohort(cohortData);
		}
	}, [cohortData]);

	// Fetch products
	useEffect(() => {
		async function fetchProducts() {
			setLoadingProducts(true);
			try {
				const response = await fetch("/api/products");
				if (response.ok) {
					const result = await response.json();
					setProducts(result.data || []);
				}
			} catch (error) {
				console.error("Error fetching products:", error);
			} finally {
				setLoadingProducts(false);
			}
		}
		fetchProducts();
	}, []);

	// Fetch enrolled students
	useEffect(() => {
		async function fetchEnrolledStudents() {
			if (!cohortId) return;

			setLoadingStudents(true);
			try {
				const response = await fetch(
					`/api/enrollments?cohortId=${cohortId}&limit=100`,
				);
				if (response.ok) {
					const result = await response.json();
					setEnrolledStudents(result.enrollments || []);
				}
			} catch (error) {
				console.error("Error fetching enrolled students:", error);
			} finally {
				setLoadingStudents(false);
			}
		}
		fetchEnrolledStudents();
	}, [cohortId]);

	// Fetch classes
	useEffect(() => {
		async function fetchClasses() {
			if (!cohortId) return;

			setLoadingClasses(true);
			try {
				const response = await fetch(`/api/cohorts/${cohortId}/classes`);
				if (response.ok) {
					const result = await response.json();
					setClasses(result || []);
				}
			} catch (error) {
				console.error("Error fetching classes:", error);
			} finally {
				setLoadingClasses(false);
			}
		}
		fetchClasses();
	}, [cohortId]);

	// Update cohort field
	const updateCohortField = async (field: string, value: any) => {
		try {
			const response = await fetch(`/api/cohorts/${cohortId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ [field]: value }),
			});

			if (!response.ok) throw new Error("Failed to update");

			const updated = await response.json();
			setCohort(updated);
			toast.success("Updated successfully");
		} catch (error) {
			toast.error("Failed to update");
			throw error;
		}
	};

	// Navigate to create enrollment
	const navigateToCreateEnrollment = () => {
		const params = new URLSearchParams({
			cohortId: cohortId,
			cohortName: `${cohort?.format} - ${formatLevel(cohort?.starting_level)}`,
			redirectTo: `/admin/cohorts/${cohortId}`,
		});
		router.push(`/admin/students/enrollments/new?${params.toString()}`);
	};

	// Navigate to create class
	const navigateToCreateClass = () => {
		const params = new URLSearchParams({
			cohortId: cohortId,
			cohortName: `${cohort?.format} - ${formatLevel(cohort?.starting_level)}`,
		});
		router.push(`/admin/cohorts/new?${params.toString()}`);
	};

	// Open weekly session modal for create
	const navigateToAddSession = () => {
		setSessionToEdit(null);
		setWeeklySessionModalOpen(true);
	};

	// Open weekly session modal for edit
	const handleEditSession = (session: any) => {
		setSessionToEdit(session);
		setWeeklySessionModalOpen(true);
	};

	// Delete cohort
	const handleDeleteCohort = async () => {
		setIsDeleting(true);
		try {
			const response = await fetch(`/api/cohorts/${cohortId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete cohort");
			}

			toast.success("Cohort deleted successfully");
			router.push("/admin/cohorts");
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Failed to delete cohort");
		} finally {
			setIsDeleting(false);
			setShowDeleteConfirm(false);
		}
	};

	// Finalize setup
	const handleFinalizeSetup = async () => {
		setIsFinalizing(true);
		try {
			const response = await fetch(`/api/cohorts/${cohortId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ setup_finalized: true }),
			});

			if (!response.ok) throw new Error("Failed to finalize setup");

			const updated = await response.json();
			setCohort(updated);
			toast.success("Cohort setup finalized successfully");
		} catch (error) {
			toast.error("Failed to finalize setup");
		} finally {
			setIsFinalizing(false);
			setShowFinalizeConfirm(false);
		}
	};

	// Update class field
	const updateClassField = async (
		classId: string,
		field: string,
		value: any,
	) => {
		try {
			const response = await fetch(`/api/classes/${classId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ [field]: value }),
			});

			if (!response.ok) throw new Error("Failed to update class");

			const updated = await response.json();
			setClasses(classes.map((c) => (c.id === classId ? updated : c)));
			toast.success("Class updated successfully");
		} catch (error) {
			toast.error("Failed to update class");
			throw error;
		}
	};

	// Handle class click
	const handleClassClick = (classItem: any) => {
		setSelectedClass(classItem);
		setClassModalOpen(true);
	};

	// Handle class update from modal
	const handleClassUpdate = (updatedClass: any) => {
		setClasses(
			classes.map((c) => (c.id === updatedClass.id ? updatedClass : c)),
		);
		setSelectedClass(updatedClass);
	};

	// Show loading skeleton while loading
	if (isLoading) {
		return (
			<div className="min-h-screen bg-muted/30">
				{/* Header Skeleton */}
				<div className="border-b bg-background">
					<div className="px-6 py-3">
						<div className="animate-pulse">
							{/* Breadcrumb skeleton */}
							<div className="mb-2 flex items-center gap-2">
								<div className="h-4 w-16 rounded bg-muted" />
								<div className="h-3 w-3 rounded bg-muted" />
								<div className="h-4 w-24 rounded bg-muted" />
							</div>
							{/* Title and badges skeleton */}
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-full bg-muted" />
									<div>
										<div className="mb-2 h-6 w-32 rounded bg-muted" />
										<div className="flex items-center gap-2">
											<div className="h-4 w-20 rounded bg-muted" />
											<div className="h-4 w-16 rounded bg-muted" />
											<div className="h-4 w-24 rounded bg-muted" />
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<div className="h-9 w-32 rounded bg-muted" />
									<div className="h-9 w-9 rounded bg-muted" />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Content Skeleton */}
				<div className="space-y-4 px-6 py-4">
					{/* Cohort Information Section Skeleton */}
					<div className="rounded-lg border bg-card">
						<div className="border-b p-4">
							<div className="h-5 w-40 rounded bg-muted" />
						</div>
						<div className="p-6">
							<div className="grid animate-pulse gap-8 lg:grid-cols-3">
								{/* Basic Details */}
								<div className="space-y-4">
									<div className="mb-4 h-3 w-24 rounded bg-muted" />
									{[1, 2, 3, 4].map((i) => (
										<div key={i} className="flex items-start gap-3">
											<div className="mt-0.5 h-4 w-4 rounded bg-muted" />
											<div className="flex-1 space-y-1">
												<div className="h-3 w-16 rounded bg-muted" />
												<div className="h-4 w-24 rounded bg-muted" />
											</div>
										</div>
									))}
								</div>

								{/* Language Progress */}
								<div className="space-y-4">
									<div className="mb-4 h-3 w-32 rounded bg-muted" />
									{[1, 2, 3].map((i) => (
										<div key={i} className="flex items-start gap-3">
											<div className="mt-0.5 h-4 w-4 rounded bg-muted" />
											<div className="flex-1 space-y-1">
												<div className="h-3 w-20 rounded bg-muted" />
												<div className="h-5 w-16 rounded bg-muted" />
											</div>
										</div>
									))}
								</div>

								{/* Resources */}
								<div className="space-y-4">
									<div className="mb-4 h-3 w-20 rounded bg-muted" />
									{[1, 2].map((i) => (
										<div key={i} className="flex items-start gap-3">
											<div className="mt-0.5 h-4 w-4 rounded bg-muted" />
											<div className="flex-1 space-y-1">
												<div className="h-3 w-16 rounded bg-muted" />
												<div className="h-4 w-28 rounded bg-muted" />
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Tabs Skeleton */}
					<div className="space-y-4">
						<div className="flex gap-1 border-b">
							{["Enrollments", "Classes", "Attendance"].map((tab) => (
								<div
									key={tab}
									className="h-10 w-32 animate-pulse rounded-t bg-muted"
								/>
							))}
						</div>

						{/* Tab Content Skeleton */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="h-6 w-40 animate-pulse rounded bg-muted" />
							</div>
							<div className="grid gap-2">
								{[1, 2, 3].map((i) => (
									<div
										key={i}
										className="animate-pulse rounded-lg border bg-card p-4"
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div className="h-9 w-9 rounded-full bg-muted" />
												<div className="space-y-2">
													<div className="h-4 w-32 rounded bg-muted" />
													<div className="h-3 w-48 rounded bg-muted" />
												</div>
											</div>
											<div className="h-8 w-8 rounded bg-muted" />
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Wait for cohort data to be set in state - show skeleton
	if (!cohort && cohortData) {
		return (
			<div className="min-h-screen bg-muted/30">
				{/* Header Skeleton */}
				<div className="border-b bg-background">
					<div className="px-6 py-3">
						<div className="animate-pulse">
							{/* Breadcrumb skeleton */}
							<div className="mb-2 flex items-center gap-2">
								<div className="h-4 w-16 rounded bg-muted" />
								<div className="h-3 w-3 rounded bg-muted" />
								<div className="h-4 w-24 rounded bg-muted" />
							</div>
							{/* Title and badges skeleton */}
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-full bg-muted" />
									<div>
										<div className="mb-2 h-6 w-32 rounded bg-muted" />
										<div className="flex items-center gap-2">
											<div className="h-4 w-20 rounded bg-muted" />
											<div className="h-4 w-16 rounded bg-muted" />
											<div className="h-4 w-24 rounded bg-muted" />
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<div className="h-9 w-32 rounded bg-muted" />
									<div className="h-9 w-9 rounded bg-muted" />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Content Skeleton */}
				<div className="space-y-4 px-6 py-4">
					{/* Simple loading message */}
					<div className="rounded-lg border bg-card p-8">
						<div className="animate-pulse space-y-4">
							<div className="h-5 w-40 rounded bg-muted" />
							<div className="h-4 w-64 rounded bg-muted" />
							<div className="h-4 w-48 rounded bg-muted" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Show error state only if query succeeded but no data found, or if there's an error
	if ((isSuccess && !cohortData) || error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-muted/30">
				<div className="text-center">
					<School className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
					<h2 className="mb-2 font-semibold text-lg">Cohort not found</h2>
					<p className="mb-4 text-muted-foreground">
						The cohort you're looking for doesn't exist or couldn't be loaded.
					</p>
					<Button onClick={() => router.push("/admin/cohorts")}>
						Back to Classes
					</Button>
				</div>
			</div>
		);
	}

	// If somehow we get here without cohort, return null to avoid errors
	if (!cohort) {
		return null;
	}

	// Get initials for avatar
	const format = cohort.products?.format || "group";
	const initials = format === "group" ? "GC" : "PC";
	const cohortName = `${
		format.charAt(0).toUpperCase() + format.slice(1)
	} Cohort`;
	const sessionCount = cohortWithSessions?.weekly_sessions?.length || 0;
	const studentCount = enrolledStudents.length;

	return (
		<div className="min-h-screen bg-muted/30">
			{/* Enhanced Header with Breadcrumb */}
			<div className="border-b bg-background">
				<div className="px-6 py-3">
					<div className="mb-2 flex items-center gap-2 text-muted-foreground text-sm">
						<Link
							href="/admin/cohorts"
							className="transition-colors hover:text-foreground"
						>
							Classes
						</Link>
						<ChevronRight className="h-3 w-3" />
						<span>{cohortName}</span>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
								<span className="font-semibold text-primary text-sm">
									{initials}
								</span>
							</div>
							<div>
								<h1 className="font-semibold text-xl">{cohortName}</h1>
								<div className="mt-0.5 flex items-center gap-2">
									<Badge
										variant={getStatusVariant(cohort.cohort_status)}
										className="h-4 px-1.5 text-[10px]"
									>
										{formatStatus(cohort.cohort_status)}
									</Badge>
									<Badge variant="outline" className="h-4 px-1.5 text-[10px]">
										{formatLevel(cohort.starting_level)} →{" "}
										{formatLevel(cohort.current_level || cohort.starting_level)}
									</Badge>
									{cohort.room_type && (
										<Badge variant="outline" className="h-4 px-1.5 text-[10px]">
											{formatRoomType(cohort.room_type)}
										</Badge>
									)}
								</div>
							</div>
						</div>

						<div className="flex items-center gap-2">
							{!cohort.setup_finalized ? (
								<Button
									variant="default"
									size="sm"
									onClick={() => setShowFinalizeConfirm(true)}
								>
									<CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
									Finalize Setup
								</Button>
							) : (
								<Button
									variant="outline"
									size="sm"
									disabled
									className="border-green-200 bg-green-50 text-green-700"
								>
									<CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
									Setup Complete
								</Button>
							)}

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="sm">
										<MoreVertical className="h-3.5 w-3.5" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuItem
										className="text-destructive focus:text-destructive"
										onClick={() => setShowDeleteConfirm(true)}
									>
										<Trash2 className="mr-2 h-3.5 w-3.5" />
										Delete Cohort
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>
			</div>

			<div className="space-y-4 px-6 py-4">
				{/* Cohort Information with inline editing */}
				<EditableSection title="Cohort Information">
					{(editing) => (
						<div className="grid gap-8 lg:grid-cols-3">
							{/* Basic Details */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Basic Details
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<School className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Format:</p>
											{editing ? (
												<InlineEditField
													value={cohort.products?.format || "N/A"}
													onSave={(value) => updateCohortField("format", value)}
													editing={editing}
													type="select"
													options={[
														{ value: "group", label: "Group" },
														{ value: "private", label: "Private" },
													]}
												/>
											) : (
												<p className="font-medium text-sm">
													{cohort.products?.format
														? cohort.products.format.charAt(0).toUpperCase() +
															cohort.products.format.slice(1)
														: "N/A"}
												</p>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Activity className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Status:</p>
											{editing ? (
												<InlineEditField
													value={cohort.cohort_status}
													onSave={(value) =>
														updateCohortField("cohort_status", value)
													}
													editing={editing}
													type="select"
													options={statusOptions}
												/>
											) : (
												<Badge
													variant={getStatusVariant(cohort.cohort_status)}
													className="h-5 text-xs"
												>
													{formatStatus(cohort.cohort_status)}
												</Badge>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Start Date:
											</p>
											<InlineEditField
												value={cohort.start_date || ""}
												onSave={(value) =>
													updateCohortField("start_date", value || null)
												}
												editing={editing}
												type="date"
												placeholder="Select date"
											/>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Max Students:
											</p>
											{editing ? (
												<InlineEditField
													value={cohort.max_students || 10}
													onSave={(value) =>
														updateCohortField(
															"max_students",
															Number.parseInt(value) || 10,
														)
													}
													editing={editing}
													type="text"
													placeholder="10"
												/>
											) : (
												<p className="font-medium text-sm">
													{cohort.max_students || 10} students
												</p>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Language Levels */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Language Progress
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<GraduationCap className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Starting Level:
											</p>
											{editing ? (
												<InlineEditField
													value={cohort.starting_level || ""}
													onSave={(value) =>
														updateCohortField("starting_level", value || null)
													}
													editing={editing}
													type="select"
													options={levelOptions}
												/>
											) : (
												<Badge variant="outline" className="h-5 text-xs">
													{formatLevel(cohort.starting_level)}
												</Badge>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<GraduationCap className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Current Level:
											</p>
											{editing ? (
												<InlineEditField
													value={cohort.current_level || ""}
													onSave={(value) =>
														updateCohortField("current_level", value || null)
													}
													editing={editing}
													type="select"
													options={levelOptions}
												/>
											) : (
												<Badge variant="outline" className="h-5 text-xs">
													{formatLevel(
														cohort.current_level || cohort.starting_level,
													)}
												</Badge>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Room Type:
											</p>
											{editing ? (
												<InlineEditField
													value={cohort.room_type || ""}
													onSave={(value) =>
														updateCohortField("room_type", value || null)
													}
													editing={editing}
													type="select"
													options={roomTypeOptions}
												/>
											) : cohort.room_type ? (
												<Badge variant="outline" className="h-5 text-xs">
													{formatRoomType(cohort.room_type)}
												</Badge>
											) : (
												<span className="font-medium text-sm">—</span>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Resources & Links */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Resources
								</h3>
								<div className="space-y-3">
									{cohort.google_drive_folder_id && (
										<div className="flex items-start gap-3">
											<FolderOpen className="mt-0.5 h-4 w-4 text-muted-foreground" />
											<div className="flex-1 space-y-0.5">
												<p className="text-muted-foreground text-xs">
													Google Drive:
												</p>
												<a
													href={`https://drive.google.com/drive/folders/${cohort.google_drive_folder_id}`}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-1 text-primary text-sm hover:underline"
												>
													<LinkIcon className="h-3 w-3" />
													Open Folder
												</a>
											</div>
										</div>
									)}

									<div className="flex items-start gap-3">
										<BookOpen className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Product:</p>
											{editing ? (
												<InlineEditField
													value={cohort.product_id || ""}
													onSave={(value) =>
														updateCohortField("product_id", value || null)
													}
													editing={editing}
													type="select"
													options={products.map((p) => ({
														value: p.id,
														label: p.display_name,
													}))}
													placeholder={
														loadingProducts
															? "Loading products..."
															: "Select product"
													}
												/>
											) : cohort.products ? (
												<p className="font-medium text-sm">
													{cohort.products.display_name}
												</p>
											) : (
												<span className="text-muted-foreground text-sm">
													No product assigned
												</span>
											)}
										</div>
									</div>

									{cohort.products?.signup_link_for_self_checkout && (
										<div className="flex items-start gap-3">
											<LinkIcon className="mt-0.5 h-4 w-4 text-muted-foreground" />
											<div className="flex-1 space-y-0.5">
												<p className="text-muted-foreground text-xs">
													Signup Link:
												</p>
												<a
													href={cohort.products.signup_link_for_self_checkout}
													target="_blank"
													rel="noopener noreferrer"
													className="text-primary text-sm hover:underline"
												>
													View Signup Page
												</a>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					)}
				</EditableSection>

				{/* Tabs Section */}
				<Tabs defaultValue="enrollments" className="space-y-4">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="enrollments">Enrollments</TabsTrigger>
						<TabsTrigger value="classes">Classes</TabsTrigger>
						<TabsTrigger value="attendance">Attendance</TabsTrigger>
					</TabsList>

					{/* Enrollments Tab */}
					<TabsContent value="enrollments" className="space-y-4">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="font-semibold text-lg">
									Enrolled Students{" "}
									{studentCount > 0 && (
										<span className="font-normal text-muted-foreground">
											({studentCount})
										</span>
									)}
								</h2>
							</div>
							<div className="space-y-4">
								{loadingStudents ? (
									<div className="grid gap-2">
										{[1, 2, 3, 4].map((i) => (
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
																	<div className="mt-2 flex items-center gap-2">
																		<div className="h-5 w-20 rounded bg-muted" />
																		<div className="h-4 w-16 rounded bg-muted" />
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
								) : enrolledStudents.length === 0 ? (
									<div className="rounded-lg bg-muted/30 py-8 text-center">
										<Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
										<p className="mb-4 text-muted-foreground">
											No students enrolled yet
										</p>
										<Button
											variant="outline"
											size="sm"
											onClick={navigateToCreateEnrollment}
										>
											<UserPlus className="mr-2 h-4 w-4" />
											Enroll First Student
										</Button>
									</div>
								) : (
									<>
										<div className="grid gap-2">
											{enrolledStudents.map((enrollment) => {
												const enrollmentDate = enrollment.created_at
													? new Date(enrollment.created_at)
													: null;
												const statusColors = {
													paid: "bg-green-500/10 text-green-700 border-green-200",
													welcome_package_sent:
														"bg-blue-500/10 text-blue-700 border-blue-200",
													contract_signed:
														"bg-purple-500/10 text-purple-700 border-purple-200",
													interested:
														"bg-yellow-500/10 text-yellow-700 border-yellow-200",
													beginner_form_filled:
														"bg-indigo-500/10 text-indigo-700 border-indigo-200",
													dropped_out:
														"bg-red-500/10 text-red-700 border-red-200",
													declined_contract:
														"bg-red-500/10 text-red-700 border-red-200",
													contract_abandoned:
														"bg-orange-500/10 text-orange-700 border-orange-200",
													payment_abandoned:
														"bg-orange-500/10 text-orange-700 border-orange-200",
												};
												const statusColor =
													statusColors[
														enrollment.status as keyof typeof statusColors
													] || "bg-gray-500/10 text-gray-700 border-gray-200";

												return (
													<div
														key={enrollment.id}
														className="group relative overflow-hidden rounded-lg border bg-card transition-all duration-200 hover:shadow-md"
													>
														<div className="p-3">
															<div className="flex items-start justify-between gap-3">
																<div className="flex min-w-0 flex-1 items-start gap-3">
																	<div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
																		<span className="font-semibold text-primary text-xs">
																			{enrollment.students?.full_name
																				?.split(" ")
																				.map((n: string) => n[0])
																				.join("")
																				.slice(0, 2)
																				.toUpperCase() || "ST"}
																		</span>
																	</div>
																	<div className="min-w-0 flex-1">
																		<div className="flex items-start justify-between gap-2">
																			<div className="min-w-0 flex-1">
																				<Link
																					href={`/admin/students/${enrollment.student_id}`}
																					className="block truncate font-medium text-sm transition-colors hover:text-primary hover:underline"
																				>
																					{enrollment.students?.full_name ||
																						"Unknown Student"}
																				</Link>
																				<div className="mt-1 flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
																					{enrollment.students?.email && (
																						<div className="flex items-center gap-1">
																							<Mail className="h-3 w-3" />
																							<span className="truncate">
																								{enrollment.students.email}
																							</span>
																						</div>
																					)}
																					{enrollment.students?.phone && (
																						<div className="flex items-center gap-1">
																							<Phone className="h-3 w-3" />
																							<span>
																								{enrollment.students.phone}
																							</span>
																						</div>
																					)}
																					{enrollmentDate && (
																						<div className="flex items-center gap-1">
																							<Calendar className="h-3 w-3" />
																							<span>
																								Enrolled{" "}
																								{enrollmentDate.toLocaleDateString(
																									"en-US",
																									{
																										month: "short",
																										day: "numeric",
																										year: "numeric",
																									},
																								)}
																							</span>
																						</div>
																					)}
																				</div>
																			</div>
																		</div>

																		<div className="mt-2 flex items-center gap-2">
																			<Badge
																				variant="outline"
																				className={`h-5 px-2 font-medium text-[10px] ${statusColor}`}
																			>
																				{enrollment.status
																					?.replace(/_/g, " ")
																					.replace(/\b\w/g, (l: string) =>
																						l.toUpperCase(),
																					)}
																			</Badge>

																			{enrollment.status && (
																				<div className="flex items-center gap-1">
																					<div className="flex gap-0.5">
																						{[
																							"interested",
																							"beginner_form_filled",
																							"contract_signed",
																							"paid",
																							"welcome_package_sent",
																						].map((step, index) => {
																							const currentIndex = [
																								"interested",
																								"beginner_form_filled",
																								"contract_signed",
																								"paid",
																								"welcome_package_sent",
																							].indexOf(enrollment.status);
																							const isCompleted =
																								index <= currentIndex;
																							return (
																								<div
																									key={step}
																									className={`h-1 w-3 rounded-full transition-colors ${
																										isCompleted
																											? "bg-primary"
																											: "bg-muted"
																									}`}
																								/>
																							);
																						})}
																					</div>
																				</div>
																			)}
																		</div>
																	</div>

																	<Button
																		variant="outline"
																		size="sm"
																		className="h-7 px-2 opacity-0 transition-opacity group-hover:opacity-100"
																		onClick={() =>
																			router.push(
																				`/admin/students/enrollments/${enrollment.id}/edit`,
																			)
																		}
																	>
																		<Edit2 className="mr-1 h-3.5 w-3.5" />
																		Edit
																	</Button>
																</div>
															</div>
														</div>
													</div>
												);
											})}
										</div>
									</>
								)}
							</div>
						</div>
					</TabsContent>
					{/* Classes Tab */}

					<TabsContent value="classes" className="space-y-4">
						{/* Weekly Schedule */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="font-semibold text-lg">Weekly Schedule</h2>
							</div>
							<div className="space-y-4">
								{sessionCount === 0 ? (
									<div className="rounded-lg bg-muted/30 py-8 text-center">
										<Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
										<p className="mb-4 text-muted-foreground">
											No weekly sessions scheduled
										</p>
										<Button
											variant="outline"
											size="sm"
											onClick={navigateToAddSession}
										>
											<Plus className="mr-2 h-4 w-4" />
											Add First Session
										</Button>
									</div>
								) : (
									<div className="grid gap-2 lg:grid-cols-2">
										{cohortWithSessions?.weekly_sessions?.map(
											(session: any) => (
												<div
													key={session.id}
													className="group relative cursor-pointer overflow-hidden rounded-lg border bg-card transition-all duration-200 hover:shadow-md"
													onClick={() => handleEditSession(session)}
												>
													{/* Day and Time Header */}
													<div className="flex items-center justify-between border-b bg-muted/30 p-3">
														<div className="flex items-center gap-2">
															<Calendar className="h-4 w-4 text-primary" />
															<span className="font-medium text-sm">
																{session.day_of_week.charAt(0).toUpperCase() +
																	session.day_of_week.slice(1)}
															</span>
														</div>
														<div className="flex items-center gap-2">
															<Clock className="h-3.5 w-3.5 text-muted-foreground" />
															<span className="font-mono text-sm">
																{formatTime(session.start_time)} -{" "}
																{formatTime(session.end_time)}
															</span>
														</div>
													</div>

													{/* Content */}
													<div className="space-y-2 p-3">
														{/* Teacher Info */}
														{session.teachers && (
															<div className="flex items-center justify-between">
																<div className="flex items-center gap-2">
																	<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
																		<Users className="h-4 w-4 text-primary" />
																	</div>
																	<div>
																		<Link
																			href={`/admin/teachers/${session.teacher_id}`}
																			className="cursor-pointer font-medium text-sm transition-colors hover:text-primary hover:underline"
																		>
																			{session.teachers.first_name}{" "}
																			{session.teachers.last_name}
																		</Link>
																		<p className="text-muted-foreground text-xs">
																			Teacher
																		</p>
																	</div>
																</div>

																{/* Duration Badge */}
																<Badge variant="secondary" className="text-xs">
																	{(() => {
																		const start = session.start_time.split(":");
																		const end = session.end_time.split(":");
																		const startMinutes =
																			Number.parseInt(start[0]) * 60 +
																			Number.parseInt(start[1]);
																		const endMinutes =
																			Number.parseInt(end[0]) * 60 +
																			Number.parseInt(end[1]);
																		const duration = endMinutes - startMinutes;
																		const hours = Math.floor(duration / 60);
																		const minutes = duration % 60;
																		return hours > 0
																			? `${hours}h${
																					minutes > 0 ? ` ${minutes}m` : ""
																				}`
																			: `${minutes}m`;
																	})()}
																</Badge>
															</div>
														)}

														{/* Bottom Status Row */}
														<div className="flex items-center justify-between pt-1">
															<div className="flex items-center gap-1.5">
																{session.teachers
																	?.available_for_online_classes && (
																	<Badge
																		variant="outline"
																		className="h-5 px-1.5 text-xs"
																	>
																		<span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500" />
																		Online
																	</Badge>
																)}
																{session.teachers
																	?.available_for_in_person_classes && (
																	<Badge
																		variant="outline"
																		className="h-5 px-1.5 text-xs"
																	>
																		<MapPin className="mr-0.5 h-3 w-3" />
																		In-Person
																	</Badge>
																)}
															</div>
															{session.google_calendar_event_id && (
																<Badge
																	variant="default"
																	className="h-5 px-1.5 text-xs"
																>
																	<Calendar className="mr-0.5 h-3 w-3" />
																	Synced
																</Badge>
															)}
														</div>
													</div>
												</div>
											),
										)}
									</div>
								)}
								{sessionCount > 0 && (
									<Button
										variant="outline"
										size="sm"
										onClick={navigateToAddSession}
										className="w-full"
									>
										<Plus className="mr-2 h-4 w-4" />
										Add Another Session
									</Button>
								)}
							</div>
						</div>

						{/* Classes (Individual Instances) */}
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
										<p className="text-muted-foreground text-sm">
											Classes will be automatically generated from weekly
											sessions
										</p>
									</div>
								) : (
									<div className="grid gap-2">
										{classes.map((classItem) => {
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
												<div
													key={classItem.id}
													className="group relative cursor-pointer overflow-hidden rounded-lg border bg-card transition-all duration-200 hover:shadow-md"
													onClick={() => handleClassClick(classItem)}
												>
													<div className="p-3">
														<div className="flex items-start justify-between gap-3">
															<div className="flex min-w-0 flex-1 items-start gap-3">
																<div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
																	<Calendar className="h-4 w-4 text-primary" />
																</div>
																<div className="min-w-0 flex-1">
																	<div className="flex items-start justify-between gap-2">
																		<div className="min-w-0 flex-1">
																			<h3 className="font-medium text-sm">
																				{format(classDate, "EEEE, MMMM d")}
																			</h3>
																			<div className="mt-1 flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
																				<div className="flex items-center gap-1">
																					<Clock className="h-3 w-3" />
																					<span>
																						{format(startTime, "h:mm a")} -{" "}
																						{format(endTime, "h:mm a")}
																					</span>
																				</div>
																				{duration && (
																					<div className="flex items-center gap-1">
																						<span className="text-muted-foreground/60">
																							•
																						</span>
																						<span>{duration}</span>
																					</div>
																				)}
																				{classItem.teachers && (
																					<div className="flex items-center gap-1">
																						<Users className="h-3 w-3" />
																						<span>
																							{classItem.teachers.first_name}{" "}
																							{classItem.teachers.last_name}
																						</span>
																					</div>
																				)}
																				{classItem.attendance_count !==
																					undefined && (
																					<div className="flex items-center gap-1">
																						<CheckCircle2 className="h-3 w-3 text-green-600" />
																						<span>
																							{classItem.attendance_count}{" "}
																							attended
																						</span>
																					</div>
																				)}
																			</div>
																		</div>
																	</div>

																	<div className="mt-2 flex items-center justify-between">
																		<div className="flex items-center gap-2">
																			<Badge
																				variant="outline"
																				className={`h-5 px-2 font-medium text-[10px] ${statusColor}`}
																			>
																				{classItem.status
																					?.replace(/_/g, " ")
																					.replace(/\b\w/g, (l: string) =>
																						l.toUpperCase(),
																					)}
																			</Badge>

																			{cohort?.format === "online" &&
																				classItem.meeting_link && (
																					<a
																						href={classItem.meeting_link}
																						target="_blank"
																						rel="noopener noreferrer"
																						onClick={(e) => e.stopPropagation()}
																						className="inline-flex items-center gap-1 text-primary text-xs hover:underline"
																					>
																						<Video className="h-3 w-3" />
																						<span>Meeting Link</span>
																					</a>
																				)}

																			{cohort?.format === "in-person" &&
																				cohort?.room && (
																					<div className="flex items-center gap-1 text-muted-foreground text-xs">
																						<MapPin className="h-3 w-3" />
																						<span>{cohort.room}</span>
																					</div>
																				)}
																		</div>

																		{/* Drive Button - Always visible */}
																		<Button
																			variant="ghost"
																			size="sm"
																			className={`h-7 px-2 text-xs ${!classItem.google_drive_folder_id ? "cursor-not-allowed opacity-50" : "hover:bg-muted"}`}
																			onClick={(e) => {
																				e.stopPropagation();
																				if (classItem.google_drive_folder_id) {
																					window.open(
																						`https://drive.google.com/drive/folders/${classItem.google_drive_folder_id}`,
																						"_blank",
																					);
																				}
																			}}
																			disabled={
																				!classItem.google_drive_folder_id
																			}
																		>
																			<FolderOpen className="mr-1 h-3.5 w-3.5" />
																			Drive
																			{classItem.google_drive_folder_id && (
																				<ExternalLink className="ml-1 h-2.5 w-2.5" />
																			)}
																		</Button>
																	</div>
																</div>

																<Button
																	variant="ghost"
																	size="icon"
																	className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
																	onClick={(e) => {
																		e.stopPropagation();
																		handleClassClick(classItem);
																	}}
																>
																	<ChevronRight className="h-4 w-4" />
																</Button>
															</div>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>
						</div>
					</TabsContent>

					{/* Attendance Tab */}
					<TabsContent value="attendance" className="space-y-4">
						<AttendanceSection cohortId={cohortId} />
					</TabsContent>
				</Tabs>

				{/* System Information - Less prominent at the bottom */}
				<div className="mt-8 border-t pt-6">
					<div className="mx-auto max-w-3xl">
						<div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground/70 text-xs">
							<div className="flex items-center gap-2">
								<span>ID:</span>
								<code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono">
									{cohort.id.slice(0, 8)}
								</code>
							</div>
							{cohort.product_id && (
								<div className="flex items-center gap-2">
									<span>Product:</span>
									<code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono">
										{cohort.product_id.slice(0, 8)}
									</code>
								</div>
							)}
							{cohort.airtable_record_id && (
								<div className="flex items-center gap-2">
									<span>Airtable:</span>
									<code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono">
										{cohort.airtable_record_id}
									</code>
								</div>
							)}
							<div className="flex items-center gap-2">
								<Clock className="h-3 w-3" />
								<span>Created:</span>
								<span>
									{format(
										new Date(cohort.created_at),
										"MMM d, yyyy 'at' h:mm a",
									)}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="h-3 w-3" />
								<span>Updated:</span>
								<span>
									{format(
										new Date(cohort.updated_at),
										"MMM d, yyyy 'at' h:mm a",
									)}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<WeeklySessionModal
				open={weeklySessionModalOpen}
				onClose={() => {
					setWeeklySessionModalOpen(false);
					setSessionToEdit(null);
				}}
				cohortId={cohortId}
				sessionToEdit={sessionToEdit}
			/>

			<AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Cohort</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this cohort? This action cannot be
							undone. All associated classes and weekly sessions will be
							removed.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteCohort}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog
				open={showFinalizeConfirm}
				onOpenChange={setShowFinalizeConfirm}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Finalize Cohort Setup</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to finalize the setup for this cohort? Once
							finalized, this action cannot be undone. Make sure all details are
							correct:
							<ul className="mt-2 space-y-1 text-sm">
								<li>
									• Start date:{" "}
									{cohort.start_date
										? new Date(cohort.start_date).toLocaleDateString()
										: "Not set"}
								</li>
								<li>• Max students: {cohort.max_students || 10}</li>
								<li>• Weekly sessions: {sessionCount} configured</li>
								<li>• Current enrollments: {enrolledStudents.length}</li>
							</ul>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isFinalizing}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleFinalizeSetup}
							disabled={isFinalizing}
							className="bg-primary text-primary-foreground hover:bg-primary/90"
						>
							{isFinalizing ? "Finalizing..." : "Finalize Setup"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<ClassDetailsModal
				open={classModalOpen}
				onClose={() => {
					setClassModalOpen(false);
					setSelectedClass(null);
				}}
				classItem={selectedClass}
				onUpdate={handleClassUpdate}
			/>
		</div>
	);
}
