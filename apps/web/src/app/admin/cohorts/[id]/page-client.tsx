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
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LinkedRecordBadge } from "@/components/ui/linked-record-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { finalizeSetup } from "@/features/cohorts/actions/finalize-setup";
import { CohortAttendance } from "@/features/cohorts/components/CohortAttendance";
import { CohortClasses } from "@/features/cohorts/components/CohortClasses";
import { CohortEnrollments } from "@/features/cohorts/components/CohortEnrollments";
import { WeeklySessionModal } from "@/features/cohorts/components/WeeklySessionModal";
import {
	useCohort,
	useCohortWithSessions,
} from "@/features/cohorts/queries/cohorts.queries";
import type { CohortStatus } from "@/features/cohorts/schemas/cohort.schema";

import { format } from "date-fns";
import {
	Activity,
	BookOpen,
	Calendar,
	CheckCircle2,
	ChevronRight,
	Clock,
	GraduationCap,
	MapPin,
	MoreVertical,
	Plus,
	School,
	Trash2,
	Users,
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
const formatLevel = (
	levelId: string | null | undefined,
	levels: any[] = [],
) => {
	if (!levelId) return "Not set";

	// Try to find the level in the fetched language levels
	if (levels && levels.length > 0) {
		const level = levels.find((l) => l.id === levelId);
		if (level) {
			return level.display_name || level.code || levelId;
		}
	}

	// If levels haven't loaded yet or level not found, show the ID nicely formatted
	// This prevents showing "Not set" when the level is actually set
	return levelId;
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
	const [attendanceClassId, setAttendanceClassId] = useState<
		string | undefined
	>(undefined);
	const [activeTab, setActiveTab] = useState("enrollments");

	// Enrollment progress state
	const [enrollmentData, setEnrollmentData] = useState<{
		paid: number;
		welcomePackageSent: number;
		total: number;
		maxStudents: number;
	}>({
		paid: 0,
		welcomePackageSent: 0,
		total: 0,
		maxStudents: 0,
	});
	const [loadingEnrollments, setLoadingEnrollments] = useState(false);

	// Language levels from database
	const [languageLevels, setLanguageLevels] = useState<any[]>([]);

	// Local state for edited values
	const [editedCohort, setEditedCohort] = useState<any>(null);

	// Update the cohort when data changes
	useEffect(() => {
		if (cohortData) {
			setCohort(cohortData);
			setEditedCohort(cohortData); // Initialize edited state
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

	// Fetch language levels
	useEffect(() => {
		async function fetchLanguageLevels() {
			try {
				const response = await fetch("/api/language-levels");
				if (response.ok) {
					const result = await response.json();
					// The API returns { data: [...], meta: {...} }
					setLanguageLevels(result.data || []);
				}
			} catch (error) {
				console.error("Error fetching language levels:", error);
				setLanguageLevels([]); // Ensure it's always an array
			}
		}
		fetchLanguageLevels();
	}, []);

	// Fetch enrollment data
	useEffect(() => {
		async function fetchEnrollmentData() {
			if (!cohortId) return;

			setLoadingEnrollments(true);
			try {
				const response = await fetch(
					`/api/enrollments?cohortId=${cohortId}&limit=1000`,
				);
				if (response.ok) {
					const result = await response.json();
					const enrollments = result.enrollments || [];

					const paid = enrollments.filter(
						(e: any) => e.status === "paid",
					).length;
					const welcomePackageSent = enrollments.filter(
						(e: any) => e.status === "welcome_package_sent",
					).length;
					const total = paid + welcomePackageSent;
					const maxStudents = cohort?.max_students || 10;

					setEnrollmentData({
						paid,
						welcomePackageSent,
						total,
						maxStudents,
					});
				}
			} catch (error) {
				console.error("Error fetching enrollment data:", error);
			} finally {
				setLoadingEnrollments(false);
			}
		}

		// Only fetch if cohort data is available
		if (cohort) {
			fetchEnrollmentData();
		}
	}, [cohortId, cohort]);

	// Update edited cohort field locally
	const updateEditedField = async (field: string, value: any) => {
		setEditedCohort({
			...editedCohort,
			[field]: value,
		});
		// Return a resolved promise to match the expected type
		return Promise.resolve();
	};

	// Save all changes to the API
	const saveAllChanges = async () => {
		try {
			// Collect all changes
			const changes: any = {};

			// Check for changes in basic fields
			if (editedCohort.cohort_status !== cohort.cohort_status) {
				changes.cohort_status = editedCohort.cohort_status;
			}
			if (editedCohort.start_date !== cohort.start_date) {
				changes.start_date = editedCohort.start_date;
			}
			if (editedCohort.max_students !== cohort.max_students) {
				changes.max_students = editedCohort.max_students;
			}
			if (editedCohort.starting_level_id !== cohort.starting_level_id) {
				changes.starting_level_id = editedCohort.starting_level_id;
			}
			if (editedCohort.current_level_id !== cohort.current_level_id) {
				changes.current_level_id = editedCohort.current_level_id;
			}
			if (editedCohort.room_type !== cohort.room_type) {
				changes.room_type = editedCohort.room_type;
			}
			if (editedCohort.product_id !== cohort.product_id) {
				changes.product_id = editedCohort.product_id;
			}
			if (editedCohort.meeting_url !== cohort.meeting_url) {
				changes.meeting_url = editedCohort.meeting_url;
			}
			if (editedCohort.folder_url !== cohort.folder_url) {
				changes.folder_url = editedCohort.folder_url;
			}

			// If no changes, return early
			if (Object.keys(changes).length === 0) {
				return;
			}

			const response = await fetch(`/api/cohorts/${cohortId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(changes),
			});

			if (!response.ok) throw new Error("Failed to update");

			const updated = await response.json();
			setCohort(updated);
			setEditedCohort(updated);
			toast.success("Changes saved successfully");
		} catch (error) {
			toast.error("Failed to save changes");
			throw error;
		}
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
		// Check if cohort has a start date before proceeding
		if (!cohort?.start_date) {
			toast.error("Cohort start date is required to finalize setup");
			setShowFinalizeConfirm(false);
			return;
		}

		setIsFinalizing(true);
		try {
			// Call the server action to finalize setup and create calendar events
			const result = await finalizeSetup({ cohortId });

			if (result?.data?.success) {
				// Update the local cohort state to reflect the finalized status
				setCohort({
					...cohort,
					setup_finalized: true,
				});
				toast.success(
					result?.data?.message || "Cohort setup finalized successfully",
				);
			} else {
				toast.error(result?.data?.message || "Failed to finalize setup");
			}
		} catch (error) {
			console.error("Error finalizing setup:", error);
			toast.error("An unexpected error occurred while finalizing setup");
		} finally {
			setIsFinalizing(false);
			setShowFinalizeConfirm(false);
		}
	};

	// Handle view attendance for a class
	const handleViewAttendance = (classId: string) => {
		setAttendanceClassId(classId);
		setActiveTab("attendance");
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
						Back to Cohorts
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
	const cohortFormat = cohort.products?.format || "group";
	const initials = cohortFormat === "group" ? "GC" : "PC";
	const cohortName = `${
		cohortFormat.charAt(0).toUpperCase() + cohortFormat.slice(1)
	} Cohort`;
	const sessionCount = cohortWithSessions?.weekly_sessions?.length || 0;

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
										{formatLevel(cohort.starting_level_id, languageLevels)} →{" "}
										{formatLevel(
											cohort.current_level_id || cohort.starting_level_id,
											languageLevels,
										)}
									</Badge>
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
				{/* Enrollment Progress - Compact */}
				<div className="rounded-lg border bg-card">
					<div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
						<h2 className="flex items-center gap-2 font-medium text-sm">
							<Users className="h-4 w-4 text-primary" />
							Enrollment Progress
						</h2>
						<div className="text-right">
							{loadingEnrollments ? (
								<span className="text-muted-foreground text-xs">
									Loading...
								</span>
							) : (
								<>
									<div className="font-semibold text-lg">
										{enrollmentData.total}/{enrollmentData.maxStudents} enrolled
									</div>
								</>
							)}
						</div>
					</div>

					{loadingEnrollments ? (
						<div className="px-4 py-3">
							<div className="h-2 w-full animate-pulse rounded-full bg-muted" />
						</div>
					) : (
						<div className="px-4 py-3">
							{/* Progress Bar */}
							<div className="relative mb-2">
								<div className="h-3 w-full overflow-hidden rounded-full bg-muted">
									<div
										className="h-full bg-gradient-to-r from-blue-800 to-blue-600/80 transition-all duration-500 ease-out"
										style={{
											width: `${Math.min(
												(enrollmentData.total / enrollmentData.maxStudents) *
													100,
												100,
											)}%`,
										}}
									/>
								</div>
								{enrollmentData.total > enrollmentData.maxStudents && (
									<div className="absolute top-0 right-0 h-2 w-1 rounded-r-full bg-yellow-500" />
								)}
							</div>

							{/* Enrollment Stats - Compact Grid */}
							<div className="grid grid-cols-3 gap-4 text-xs">
								<div className="flex items-center gap-1.5">
									<div className="h-2 w-2 rounded-full bg-green-500" />
									<span className="text-muted-foreground">Paid:</span>
									<span className="font-medium">{enrollmentData.paid}</span>
								</div>
								<div className="flex items-center gap-1.5">
									<div className="h-2 w-2 rounded-full bg-blue-500" />
									<span className="text-muted-foreground">
										Welcome Package Sent:
									</span>
									<span className="font-medium">
										{enrollmentData.welcomePackageSent}
									</span>
								</div>
								<div className="text-right">
									{enrollmentData.maxStudents - enrollmentData.total > 0 ? (
										<span className="text-muted-foreground">
											<span className="font-medium text-foreground">
												{enrollmentData.maxStudents - enrollmentData.total}
											</span>{" "}
											spots left
										</span>
									) : enrollmentData.total > enrollmentData.maxStudents ? (
										<span className="font-medium text-yellow-600">
											+{enrollmentData.total - enrollmentData.maxStudents} over
										</span>
									) : (
										<span className="font-medium text-green-600">Full</span>
									)}
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Cohort Information with inline editing */}
				<EditableSection
					title="Cohort Information"
					onEditStart={() => {
						// Reset to current values when starting to edit
						setEditedCohort(cohort);
					}}
					onSave={saveAllChanges}
					onCancel={() => {
						// Reset to original values when canceling
						setEditedCohort(cohort);
					}}
				>
					{(editing) => (
						<div className="grid gap-8 lg:grid-cols-3">
							{/* Basic Details */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Basic Details
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<Activity className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Status:</p>
											{editing ? (
												<InlineEditField
													value={editedCohort?.cohort_status}
													onSave={(value) =>
														updateEditedField("cohort_status", value)
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
												value={editedCohort?.start_date || ""}
												onSave={(value) =>
													updateEditedField("start_date", value || null)
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
													value={editedCohort?.max_students || 10}
													onSave={(value) =>
														updateEditedField(
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
													value={editedCohort?.starting_level_id || ""}
													onSave={(value) =>
														updateEditedField(
															"starting_level_id",
															value || null,
														)
													}
													editing={editing}
													type="select"
													options={(Array.isArray(languageLevels)
														? languageLevels
														: []
													).map((level) => ({
														value: level.id,
														label: level.display_name || level.code || level.id,
													}))}
												/>
											) : (
												<Badge variant="outline" className="h-5 text-xs">
													{formatLevel(
														cohort.starting_level_id,
														languageLevels,
													)}
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
													value={editedCohort?.current_level_id || ""}
													onSave={(value) =>
														updateEditedField("current_level_id", value || null)
													}
													editing={editing}
													type="select"
													options={(Array.isArray(languageLevels)
														? languageLevels
														: []
													).map((level) => ({
														value: level.id,
														label: level.display_name || level.code || level.id,
													}))}
												/>
											) : (
												<Badge variant="outline" className="h-5 text-xs">
													{formatLevel(
														cohort.current_level_id || cohort.starting_level_id,
														languageLevels,
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
													value={editedCohort?.room_type || ""}
													onSave={(value) =>
														updateEditedField("room_type", value || null)
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

							{/* Product Information */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Product
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<BookOpen className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Product:</p>
											{editing ? (
												<InlineEditField
													value={editedCohort?.product_id || ""}
													onSave={async (value) => {
														await updateEditedField(
															"product_id",
															value || null,
														);
														// Update format and location based on selected product
														if (value) {
															const selectedProduct = products.find(
																(p) => p.id === value,
															);
															if (selectedProduct) {
																setEditedCohort((prev: any) => ({
																	...prev,
																	products: {
																		...prev?.products,
																		id: selectedProduct.id,
																		display_name: selectedProduct.display_name,
																		format: selectedProduct.format,
																		location: selectedProduct.location,
																	},
																}));
															}
														}
													}}
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
												<LinkedRecordBadge
													href={`/admin/cohorts/products/${cohort.products.id}`}
													label={cohort.products.display_name}
													icon={BookOpen}
													className="text-xs"
												/>
											) : (
												<span className="text-muted-foreground text-sm">
													No product assigned
												</span>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<School className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Format:</p>
											<p className="font-medium text-sm">
												{editedCohort?.products?.format ||
												cohort.products?.format
													? (
															editedCohort?.products?.format ||
															cohort.products?.format
														)
															.charAt(0)
															.toUpperCase() +
														(
															editedCohort?.products?.format ||
															cohort.products?.format
														).slice(1)
													: "N/A"}
											</p>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Location:</p>
											<p className="font-medium text-sm">
												{(() => {
													const location =
														editedCohort?.products?.location ||
														cohort.products?.location;
													if (!location) return "N/A";
													return location === "in_person"
														? "In-Person"
														: location === "online"
															? "Online"
															: location.charAt(0).toUpperCase() +
																location.slice(1);
												})()}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</EditableSection>

				{/* Weekly Schedule Section */}
				<div className="rounded-lg border bg-card">
					<div className="border-b p-4">
						<div className="flex items-center justify-between">
							<h2 className="font-semibold text-lg">Weekly Schedule</h2>
							{sessionCount > 0 && (
								<Button
									variant="outline"
									size="sm"
									onClick={navigateToAddSession}
								>
									<Plus className="mr-2 h-4 w-4" />
									Add Session
								</Button>
							)}
						</div>
					</div>
					<div className="p-4">
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
								{cohortWithSessions?.weekly_sessions?.map((session: any) => (
									<div
										key={session.id}
										className="group relative cursor-pointer overflow-hidden rounded-lg border bg-card transition-all duration-200 hover:shadow-md"
										onClick={() => handleEditSession(session)}
										role="button"
										tabIndex={0}
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
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Tabs Section */}
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="space-y-4"
				>
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="enrollments">Enrollments</TabsTrigger>
						<TabsTrigger value="classes">Classes</TabsTrigger>
						<TabsTrigger value="attendance">Attendance</TabsTrigger>
					</TabsList>

					{/* Enrollments Tab */}
					<TabsContent value="enrollments" className="space-y-4">
						<CohortEnrollments
							cohortId={cohortId}
							cohortName={cohort?.products?.format || "Cohort"}
							cohortLevel={formatLevel(
								cohort?.starting_level_id,
								languageLevels,
							)}
						/>
					</TabsContent>

					{/* Classes Tab */}
					<TabsContent value="classes" className="space-y-4">
						<CohortClasses
							cohortId={cohortId}
							cohortFormat={cohort?.products?.format}
							cohortRoom={cohort?.room}
							onViewAttendance={handleViewAttendance}
						/>
					</TabsContent>

					{/* Attendance Tab */}
					<TabsContent value="attendance" className="space-y-4">
						<CohortAttendance
							cohortId={cohortId}
							initialClassId={attendanceClassId}
						/>
					</TabsContent>
				</Tabs>

				{/* System Information - Less prominent at the bottom */}
				<div className="mt-8 border-t pt-6">
					<div className="mx-auto max-w-3xl">
						<div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground/70 text-xs">
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
								<span>Created at:</span>
								<span>
									{format(
										new Date(cohort.created_at),
										"MMM d, yyyy 'at' h:mm a",
									)}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="h-3 w-3" />
								<span>Updated at:</span>
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
							This will create recurring Google Calendar events for all weekly
							sessions and send invitations to enrolled students and assigned
							teachers. Make sure all details are correct:
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="py-3">
						<ul className="space-y-1 text-muted-foreground text-sm">
							<li>
								• Start date:{" "}
								{cohort.start_date
									? new Date(cohort.start_date).toLocaleDateString()
									: "Not set"}
							</li>
							<li>• Max students: {cohort.max_students || 10}</li>
							<li>• Weekly sessions: {sessionCount} configured</li>
							<li>• Current enrollments: {enrollmentData.total}</li>
						</ul>
					</div>
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
		</div>
	);
}
