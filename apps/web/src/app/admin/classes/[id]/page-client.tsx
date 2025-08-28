"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditableSection } from "@/components/inline-edit/EditableSection";
import { InlineEditField } from "@/components/inline-edit/InlineEditField";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  GraduationCap,
  ChevronRight,
  MoreVertical,
  Plus,
  Trash2,
  FolderOpen,
  School,
  Activity,
  UserPlus,
  BarChart3,
  BookOpen,
  Link as LinkIcon,
  Mail,
  Phone,
  CheckCircle2,
  Video,
  Edit2,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import Link from "next/link";
import { format } from "date-fns";
import {
  useCohort,
  useCohortWithSessions,
} from "@/features/cohorts/queries/cohorts.queries";
import type { CohortStatus } from "@/features/cohorts/schemas/cohort.schema";
import { WeeklySessionModal } from "@/features/cohorts/components/WeeklySessionModal";
import { AttendanceSection } from "@/features/attendance/components/AttendanceSection";
import { ClassDetailsModal } from "@/features/classes/components/ClassDetailsModal";

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
          `/api/enrollments?cohortId=${cohortId}&limit=100`
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
      redirectTo: `/admin/classes/${cohortId}`,
    });
    router.push(`/admin/students/enrollments/new?${params.toString()}`);
  };

  // Navigate to create class
  const navigateToCreateClass = () => {
    const params = new URLSearchParams({
      cohortId: cohortId,
      cohortName: `${cohort?.format} - ${formatLevel(cohort?.starting_level)}`,
    });
    router.push(`/admin/classes/new?${params.toString()}`);
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
      router.push("/admin/classes");
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
    value: any
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
    setClasses(classes.map((c) => (c.id === updatedClass.id ? updatedClass : c)));
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
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-3 w-3 bg-muted rounded" />
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
              {/* Title and badges skeleton */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div>
                    <div className="h-6 w-32 bg-muted rounded mb-2" />
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-20 bg-muted rounded" />
                      <div className="h-4 w-16 bg-muted rounded" />
                      <div className="h-4 w-24 bg-muted rounded" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-9 w-32 bg-muted rounded" />
                  <div className="h-9 w-9 bg-muted rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="px-6 py-4 space-y-4">
          {/* Cohort Information Section Skeleton */}
          <div className="rounded-lg border bg-card">
            <div className="p-4 border-b">
              <div className="h-5 w-40 bg-muted rounded" />
            </div>
            <div className="p-6">
              <div className="animate-pulse grid gap-8 lg:grid-cols-3">
                {/* Basic Details */}
                <div className="space-y-4">
                  <div className="h-3 w-24 bg-muted rounded mb-4" />
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-4 w-4 bg-muted rounded mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 w-16 bg-muted rounded" />
                        <div className="h-4 w-24 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Language Progress */}
                <div className="space-y-4">
                  <div className="h-3 w-32 bg-muted rounded mb-4" />
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-4 w-4 bg-muted rounded mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 w-20 bg-muted rounded" />
                        <div className="h-5 w-16 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resources */}
                <div className="space-y-4">
                  <div className="h-3 w-20 bg-muted rounded mb-4" />
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-4 w-4 bg-muted rounded mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 w-16 bg-muted rounded" />
                        <div className="h-4 w-28 bg-muted rounded" />
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
                <div key={tab} className="h-10 w-32 bg-muted rounded-t animate-pulse" />
              ))}
            </div>
            
            {/* Tab Content Skeleton */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-6 w-40 bg-muted rounded animate-pulse" />
              </div>
              <div className="grid gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg border bg-card p-4 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-muted" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-muted rounded" />
                          <div className="h-3 w-48 bg-muted rounded" />
                        </div>
                      </div>
                      <div className="h-8 w-8 bg-muted rounded" />
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
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-3 w-3 bg-muted rounded" />
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
              {/* Title and badges skeleton */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div>
                    <div className="h-6 w-32 bg-muted rounded mb-2" />
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-20 bg-muted rounded" />
                      <div className="h-4 w-16 bg-muted rounded" />
                      <div className="h-4 w-24 bg-muted rounded" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-9 w-32 bg-muted rounded" />
                  <div className="h-9 w-9 bg-muted rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="px-6 py-4 space-y-4">
          {/* Simple loading message */}
          <div className="rounded-lg border bg-card p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-5 w-40 bg-muted rounded" />
              <div className="h-4 w-64 bg-muted rounded" />
              <div className="h-4 w-48 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state only if query succeeded but no data found, or if there's an error
  if ((isSuccess && !cohortData) || error) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <School className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Cohort not found</h2>
          <p className="text-muted-foreground mb-4">
            The cohort you're looking for doesn't exist or couldn't be loaded.
          </p>
          <Button onClick={() => router.push("/admin/classes")}>
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
  const format = cohort.products?.format || 'group';
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link
              href="/admin/classes"
              className="hover:text-foreground transition-colors"
            >
              Classes
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span>{cohortName}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {initials}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-semibold">{cohortName}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge
                    variant={getStatusVariant(cohort.cohort_status)}
                    className="h-4 text-[10px] px-1.5"
                  >
                    {formatStatus(cohort.cohort_status)}
                  </Badge>
                  <Badge variant="outline" className="h-4 text-[10px] px-1.5">
                    {formatLevel(cohort.starting_level)} →{" "}
                    {formatLevel(cohort.current_level || cohort.starting_level)}
                  </Badge>
                  {cohort.room_type && (
                    <Badge variant="outline" className="h-4 text-[10px] px-1.5">
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
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Finalize Setup
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="bg-green-50 border-green-200 text-green-700"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
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

      <div className="px-6 py-4 space-y-4">
        {/* Cohort Information with inline editing */}
        <EditableSection title="Cohort Information">
          {(editing) => (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Basic Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Basic Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <School className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 space-y-0.5">
                      <p className="text-xs text-muted-foreground">Format:</p>
                      {editing ? (
                        <InlineEditField
                          value={cohort.products?.format || 'N/A'}
                          onSave={(value) => updateCohortField("format", value)}
                          editing={editing}
                          type="select"
                          options={[
                            { value: "group", label: "Group" },
                            { value: "private", label: "Private" },
                          ]}
                        />
                      ) : (
                        <p className="text-sm font-medium">
                          {cohort.products?.format ? cohort.products.format.charAt(0).toUpperCase() +
                            cohort.products.format.slice(1) : 'N/A'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 space-y-0.5">
                      <p className="text-xs text-muted-foreground">Status:</p>
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
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 space-y-0.5">
                      <p className="text-xs text-muted-foreground">
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
                    <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        Max Students:
                      </p>
                      {editing ? (
                        <InlineEditField
                          value={cohort.max_students || 10}
                          onSave={(value) =>
                            updateCohortField(
                              "max_students",
                              parseInt(value) || 10
                            )
                          }
                          editing={editing}
                          type="text"
                          placeholder="10"
                        />
                      ) : (
                        <p className="text-sm font-medium">
                          {cohort.max_students || 10} students
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Language Levels */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Language Progress
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 space-y-0.5">
                      <p className="text-xs text-muted-foreground">
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
                    <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 space-y-0.5">
                      <p className="text-xs text-muted-foreground">
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
                            cohort.current_level || cohort.starting_level
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 space-y-0.5">
                      <p className="text-xs text-muted-foreground">
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
                        <span className="text-sm font-medium">—</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resources & Links */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Resources
                </h3>
                <div className="space-y-3">
                  {cohort.google_drive_folder_id && (
                    <div className="flex items-start gap-3">
                      <FolderOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1 space-y-0.5">
                        <p className="text-xs text-muted-foreground">
                          Google Drive:
                        </p>
                        <a
                          href={`https://drive.google.com/drive/folders/${cohort.google_drive_folder_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <LinkIcon className="h-3 w-3" />
                          Open Folder
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 space-y-0.5">
                      <p className="text-xs text-muted-foreground">Product:</p>
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
                        <p className="text-sm font-medium">
                          {cohort.products.display_name}
                        </p>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No product assigned
                        </span>
                      )}
                    </div>
                  </div>

                  {cohort.products?.signup_link_for_self_checkout && (
                    <div className="flex items-start gap-3">
                      <LinkIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1 space-y-0.5">
                        <p className="text-xs text-muted-foreground">
                          Signup Link:
                        </p>
                        <a
                          href={cohort.products.signup_link_for_self_checkout}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
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
                <h2 className="text-lg font-semibold">
                  Enrolled Students{" "}
                  {studentCount > 0 && (
                    <span className="text-muted-foreground font-normal">
                      ({studentCount})
                    </span>
                  )}
                </h2>
              </div>
              <div className="space-y-4">
                {loadingStudents ? (
                  <div className="grid gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="group relative overflow-hidden rounded-lg border bg-card animate-pulse">
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="h-9 w-9 rounded-full bg-muted flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="space-y-2">
                                  <div className="h-4 w-32 bg-muted rounded" />
                                  <div className="flex items-center gap-3">
                                    <div className="h-3 w-40 bg-muted rounded" />
                                    <div className="h-3 w-24 bg-muted rounded" />
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="h-5 w-20 bg-muted rounded" />
                                    <div className="h-4 w-16 bg-muted rounded" />
                                  </div>
                                </div>
                              </div>
                              <div className="h-8 w-8 bg-muted rounded" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : enrolledStudents.length === 0 ? (
                  <div className="text-center py-8 bg-muted/30 rounded-lg">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No students enrolled yet
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={navigateToCreateEnrollment}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
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
                            className="group relative overflow-hidden rounded-lg border bg-card hover:shadow-md transition-all duration-200"
                          >
                            <div className="p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-semibold text-primary">
                                      {enrollment.students?.full_name
                                        ?.split(" ")
                                        .map((n: string) => n[0])
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase() || "ST"}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <Link
                                          href={`/admin/students/${enrollment.student_id}`}
                                          className="font-medium text-sm hover:text-primary hover:underline transition-colors truncate block"
                                        >
                                          {enrollment.students?.full_name ||
                                            "Unknown Student"}
                                        </Link>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
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
                                                  }
                                                )}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] h-5 px-2 font-medium ${statusColor}`}
                                      >
                                        {enrollment.status
                                          ?.replace(/_/g, " ")
                                          .replace(/\b\w/g, (l: string) =>
                                            l.toUpperCase()
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
                                    className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() =>
                                      router.push(
                                        `/admin/students/enrollments/${enrollment.id}/edit`
                                      )
                                    }
                                  >
                                    <Edit2 className="h-3.5 w-3.5 mr-1" />
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
                <h2 className="text-lg font-semibold">Weekly Schedule</h2>
              </div>
              <div className="space-y-4">
                {sessionCount === 0 ? (
                  <div className="text-center py-8 bg-muted/30 rounded-lg">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No weekly sessions scheduled
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={navigateToAddSession}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Session
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-2 lg:grid-cols-2">
                    {cohortWithSessions?.weekly_sessions?.map(
                      (session: any) => (
                        <div
                          key={session.id}
                          className="group relative overflow-hidden rounded-lg border bg-card hover:shadow-md transition-all duration-200 cursor-pointer"
                          onClick={() => handleEditSession(session)}
                        >
                          {/* Day and Time Header */}
                          <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">
                                {session.day_of_week.charAt(0).toUpperCase() +
                                  session.day_of_week.slice(1)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm font-mono">
                                {formatTime(session.start_time)} -{" "}
                                {formatTime(session.end_time)}
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-3 space-y-2">
                            {/* Teacher Info */}
                            {session.teachers && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Users className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <Link
                                      href={`/admin/teachers/${session.teacher_id}`}
                                      className="text-sm font-medium hover:text-primary hover:underline transition-colors cursor-pointer"
                                    >
                                      {session.teachers.first_name}{" "}
                                      {session.teachers.last_name}
                                    </Link>
                                    <p className="text-xs text-muted-foreground">
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
                                      parseInt(start[0]) * 60 +
                                      parseInt(start[1]);
                                    const endMinutes =
                                      parseInt(end[0]) * 60 + parseInt(end[1]);
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
                                    className="text-xs h-5 px-1.5"
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1" />
                                    Online
                                  </Badge>
                                )}
                                {session.teachers
                                  ?.available_for_in_person_classes && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs h-5 px-1.5"
                                  >
                                    <MapPin className="h-3 w-3 mr-0.5" />
                                    In-Person
                                  </Badge>
                                )}
                              </div>
                              {session.google_calendar_event_id && (
                                <Badge
                                  variant="default"
                                  className="text-xs h-5 px-1.5"
                                >
                                  <Calendar className="h-3 w-3 mr-0.5" />
                                  Synced
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
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
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Session
                  </Button>
                )}
              </div>
            </div>

            {/* Classes (Individual Instances) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Classes{" "}
                  {classes.length > 0 && (
                    <span className="text-muted-foreground font-normal">
                      ({classes.length})
                    </span>
                  )}
                </h2>
              </div>
              <div className="space-y-4">
                {loadingClasses ? (
                  <div className="grid gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="group relative overflow-hidden rounded-lg border bg-card animate-pulse">
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="h-9 w-9 rounded-full bg-muted flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="space-y-2">
                                  <div className="h-4 w-32 bg-muted rounded" />
                                  <div className="flex items-center gap-3">
                                    <div className="h-3 w-40 bg-muted rounded" />
                                    <div className="h-3 w-24 bg-muted rounded" />
                                  </div>
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2">
                                      <div className="h-5 w-20 bg-muted rounded" />
                                      <div className="h-4 w-16 bg-muted rounded" />
                                    </div>
                                    <div className="h-7 w-16 bg-muted rounded" />
                                  </div>
                                </div>
                              </div>
                              <div className="h-8 w-8 bg-muted rounded" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : classes.length === 0 ? (
                  <div className="text-center py-8 bg-muted/30 rounded-lg">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No classes scheduled yet
                    </p>
                    <p className="text-sm text-muted-foreground">
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
                        const start = classItem.start_time.split("T")[1]?.split(":");
                        const end = classItem.end_time.split("T")[1]?.split(":");
                        if (start && end) {
                          const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
                          const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
                          const diff = endMinutes - startMinutes;
                          const hours = Math.floor(diff / 60);
                          const minutes = diff % 60;
                          return hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}` : `${minutes}m`;
                        }
                        return "";
                      })();

                      return (
                        <div
                          key={classItem.id}
                          className="group relative overflow-hidden rounded-lg border bg-card hover:shadow-md transition-all duration-200 cursor-pointer"
                          onClick={() => handleClassClick(classItem)}
                        >
                          <div className="p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <Calendar className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-medium text-sm">
                                        {format(classDate, "EEEE, MMMM d")}
                                      </h3>
                                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          <span>
                                            {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                                          </span>
                                        </div>
                                        {duration && (
                                          <div className="flex items-center gap-1">
                                            <span className="text-muted-foreground/60">•</span>
                                            <span>{duration}</span>
                                          </div>
                                        )}
                                        {classItem.teachers && (
                                          <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            <span>
                                              {classItem.teachers.first_name} {classItem.teachers.last_name}
                                            </span>
                                          </div>
                                        )}
                                        {classItem.attendance_count !== undefined && (
                                          <div className="flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                                            <span>{classItem.attendance_count} attended</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] h-5 px-2 font-medium ${statusColor}`}
                                      >
                                        {classItem.status
                                          ?.replace(/_/g, " ")
                                          .replace(/\b\w/g, (l: string) =>
                                            l.toUpperCase()
                                          )}
                                      </Badge>
                                      
                                      {cohort?.format === "online" && classItem.meeting_link && (
                                        <a
                                          href={classItem.meeting_link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                        >
                                          <Video className="h-3 w-3" />
                                          <span>Meeting Link</span>
                                        </a>
                                      )}
                                      
                                      {cohort?.format === "in-person" && cohort?.room && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <MapPin className="h-3 w-3" />
                                          <span>{cohort.room}</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Drive Button - Always visible */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={`h-7 px-2 text-xs ${!classItem.google_drive_folder_id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (classItem.google_drive_folder_id) {
                                          window.open(`https://drive.google.com/drive/folders/${classItem.google_drive_folder_id}`, '_blank');
                                        }
                                      }}
                                      disabled={!classItem.google_drive_folder_id}
                                    >
                                      <FolderOpen className="h-3.5 w-3.5 mr-1" />
                                      Drive
                                      {classItem.google_drive_folder_id && (
                                        <ExternalLink className="h-2.5 w-2.5 ml-1" />
                                      )}
                                    </Button>
                                  </div>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
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
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground/70">
              <div className="flex items-center gap-2">
                <span>ID:</span>
                <code className="bg-muted/50 px-1.5 py-0.5 rounded font-mono">
                  {cohort.id.slice(0, 8)}
                </code>
              </div>
              {cohort.product_id && (
                <div className="flex items-center gap-2">
                  <span>Product:</span>
                  <code className="bg-muted/50 px-1.5 py-0.5 rounded font-mono">
                    {cohort.product_id.slice(0, 8)}
                  </code>
                </div>
              )}
              {cohort.airtable_record_id && (
                <div className="flex items-center gap-2">
                  <span>Airtable:</span>
                  <code className="bg-muted/50 px-1.5 py-0.5 rounded font-mono">
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
                    "MMM d, yyyy 'at' h:mm a"
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Updated:</span>
                <span>
                  {format(
                    new Date(cohort.updated_at),
                    "MMM d, yyyy 'at' h:mm a"
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
