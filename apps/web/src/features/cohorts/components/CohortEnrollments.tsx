"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

import { EnrollmentCreateModal } from "@/features/enrollments/components/EnrollmentCreateModal";
import { EnrollmentDetailsModal } from "@/features/enrollments/components/EnrollmentDetailsModal";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ChevronLeft,
	ChevronRight,
	Mail,
	Phone,
	Search,
	UserPlus,
	Users,
} from "lucide-react";

interface CohortEnrollmentsProps {
	cohortId: string;
	cohortName?: string;
	cohortLevel?: string;
	onEnrollmentUpdate?: () => void;
	canEnrollStudent?: boolean;
}

export function CohortEnrollments({
	cohortId,
	cohortName = "Cohort",
	cohortLevel = "",
	onEnrollmentUpdate,
	canEnrollStudent = true,
}: CohortEnrollmentsProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	// Pagination and filtering state
	const [enrollmentPage, setEnrollmentPage] = useState(1);
	const enrollmentsPerPage = 10;
	const [studentSearch, setStudentSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");

	// Fetch enrolled students using React Query
	const { data, isLoading: loadingStudents } = useQuery({
		queryKey: ["enrollments", "cohort", cohortId],
		queryFn: async () => {
			const response = await fetch(
				`/api/enrollments?cohortId=${cohortId}&limit=100`,
			);
			if (!response.ok) {
				throw new Error("Failed to fetch enrollments");
			}
			const result = await response.json();
			return result.enrollments || [];
		},
		enabled: !!cohortId,
	});

	const enrolledStudents = data || [];

	// Open create enrollment modal
	const openCreateEnrollmentModal = () => {
		setIsCreateModalOpen(true);
	};

	const handleEnrollmentClick = (enrollment: any) => {
		setSelectedEnrollment(enrollment);
		setIsModalOpen(true);
	};

	const handleModalClose = () => {
		setIsModalOpen(false);
		setSelectedEnrollment(null);
	};

	const handleEnrollmentUpdate = () => {
		// Invalidate the cohort enrollments query to refetch
		queryClient.invalidateQueries({
			queryKey: ["enrollments", "cohort", cohortId],
		});
		// Also refresh the parent's enrollment progress data
		if (onEnrollmentUpdate) {
			onEnrollmentUpdate();
		}
	};

	const studentCount = enrolledStudents.length;

	// Filter enrollments
	const filteredEnrollments = enrolledStudents.filter((enrollment: any) => {
		const searchMatch =
			studentSearch === "" ||
			enrollment.students?.full_name
				?.toLowerCase()
				.includes(studentSearch.toLowerCase()) ||
			enrollment.students?.email
				?.toLowerCase()
				.includes(studentSearch.toLowerCase()) ||
			enrollment.students?.mobile_phone_number?.includes(studentSearch);

		const statusMatch =
			statusFilter === "all" || enrollment.status === statusFilter;

		return searchMatch && statusMatch;
	});

	// Paginate
	const paginatedEnrollments = filteredEnrollments.slice(
		(enrollmentPage - 1) * enrollmentsPerPage,
		enrollmentPage * enrollmentsPerPage,
	);

	const totalPages = Math.ceil(filteredEnrollments.length / enrollmentsPerPage);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="font-semibold text-lg">
					Enrollments{" "}
					{studentCount > 0 && (
						<span className="font-normal text-muted-foreground">
							({studentCount})
						</span>
					)}
				</h2>
				{canEnrollStudent && (
					<Button
						variant="outline"
						size="sm"
						onClick={openCreateEnrollmentModal}
					>
						<UserPlus className="mr-2 h-4 w-4" />
						Enroll Student
					</Button>
				)}
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
						<p className="text-muted-foreground">No students enrolled yet</p>
					</div>
				) : (
					<>
						{/* Filters */}
						<div className="mb-4 flex items-center gap-3">
							<div className="relative flex-1">
								<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
								<input
									type="text"
									placeholder="Search students..."
									value={studentSearch}
									onChange={(e) => {
										setStudentSearch(e.target.value);
										setEnrollmentPage(1); // Reset to first page on search
									}}
									className="h-9 w-full rounded-md border bg-background px-3 pl-9 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</div>

							<Select
								value={statusFilter}
								onValueChange={(value) => {
									setStatusFilter(value);
									setEnrollmentPage(1); // Reset to first page on filter change
								}}
							>
								<SelectTrigger className="w-[200px]">
									<SelectValue placeholder="Filter by status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Statuses</SelectItem>
									<SelectItem value="interested">Interested</SelectItem>
									<SelectItem value="beginner_form_filled">
										Form Filled
									</SelectItem>
									<SelectItem value="contract_signed">
										Contract Signed
									</SelectItem>
									<SelectItem value="paid">Paid</SelectItem>
									<SelectItem value="welcome_package_sent">
										Welcome Package Sent
									</SelectItem>
									<SelectItem value="transitioning">Transitioning</SelectItem>
									<SelectItem value="offboarding">Offboarding</SelectItem>
									<SelectItem value="payment_abandoned">
										Payment Abandoned
									</SelectItem>
									<SelectItem value="dropped_out">Dropped Out</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Table */}
						<div className="overflow-hidden rounded-lg border">
							<Table>
								<TableHeader>
									<TableRow className="bg-muted/30">
										<TableHead className="w-[300px]">Student</TableHead>
										<TableHead className="w-[250px]">Contact</TableHead>
										<TableHead className="w-[180px]">Status</TableHead>
										<TableHead className="w-[150px]">Enrolled</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{paginatedEnrollments.length === 0 ? (
										<TableRow>
											<TableCell colSpan={4} className="h-32 text-center">
												<div className="flex flex-col items-center justify-center">
													<Users className="mb-2 h-8 w-8 text-muted-foreground/30" />
													<p className="text-muted-foreground text-sm">
														{studentSearch || statusFilter !== "all"
															? "No students found matching filters"
															: "No students enrolled yet"}
													</p>
												</div>
											</TableCell>
										</TableRow>
									) : (
										paginatedEnrollments.map((enrollment: any) => {
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
												<TableRow
													key={enrollment.id}
													className="group cursor-pointer hover:bg-muted/5"
													onClick={() => handleEnrollmentClick(enrollment)}
												>
													{/* Student Column */}
													<TableCell>
														<div className="flex items-center gap-3">
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
															<div>
																<p className="font-medium text-sm">
																	{enrollment.students?.full_name ||
																		"Unknown Student"}
																</p>
																<Link
																	href={`/admin/students/${enrollment.student_id}`}
																	className="text-muted-foreground text-xs transition-colors hover:text-primary hover:underline"
																	onClick={(e) => e.stopPropagation()}
																>
																	View Profile
																</Link>
															</div>
														</div>
													</TableCell>

													{/* Contact Column */}
													<TableCell>
														<div className="space-y-1">
															{enrollment.students?.email && (
																<div className="flex items-center gap-1 text-muted-foreground text-xs">
																	<Mail className="h-3 w-3" />
																	<span className="truncate">
																		{enrollment.students.email}
																	</span>
																</div>
															)}
															{enrollment.students?.mobile_phone_number && (
																<div className="flex items-center gap-1 text-muted-foreground text-xs">
																	<Phone className="h-3 w-3" />
																	<span>
																		{enrollment.students.mobile_phone_number}
																	</span>
																</div>
															)}
															{!enrollment.students?.email &&
																!enrollment.students?.mobile_phone_number && (
																	<span className="text-muted-foreground text-xs">
																		No contact info
																	</span>
																)}
														</div>
													</TableCell>

													{/* Status Column */}
													<TableCell>
														<Badge
															variant="outline"
															className={`font-medium text-[10px] ${statusColor}`}
														>
															{enrollment.status
																?.replace(/_/g, " ")
																.replace(/\b\w/g, (l: string) =>
																	l.toUpperCase(),
																)}
														</Badge>
													</TableCell>

													{/* Enrolled Column */}
													<TableCell>
														{enrollmentDate && (
															<div className="text-muted-foreground text-xs">
																{enrollmentDate.toLocaleDateString("en-US", {
																	month: "short",
																	day: "numeric",
																	year: "numeric",
																})}
															</div>
														)}
													</TableCell>
												</TableRow>
											);
										})
									)}
								</TableBody>
							</Table>
						</div>

						{/* Pagination Controls */}
						{filteredEnrollments.length > enrollmentsPerPage && (
							<div className="mt-4 flex items-center justify-between">
								<p className="text-muted-foreground text-sm">
									Showing {(enrollmentPage - 1) * enrollmentsPerPage + 1} to{" "}
									{Math.min(
										enrollmentPage * enrollmentsPerPage,
										filteredEnrollments.length,
									)}{" "}
									of {filteredEnrollments.length} students
									{studentSearch || statusFilter !== "all" ? " (filtered)" : ""}
								</p>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											setEnrollmentPage(Math.max(1, enrollmentPage - 1))
										}
										disabled={enrollmentPage === 1}
									>
										<ChevronLeft className="h-4 w-4" />
										Previous
									</Button>
									<div className="flex items-center gap-1">
										{Array.from({ length: totalPages }, (_, i) => i + 1).map(
											(page) => (
												<Button
													key={page}
													variant={
														page === enrollmentPage ? "default" : "outline"
													}
													size="sm"
													className="h-8 w-8 p-0"
													onClick={() => setEnrollmentPage(page)}
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
											setEnrollmentPage(
												Math.min(totalPages, enrollmentPage + 1),
											)
										}
										disabled={enrollmentPage === totalPages}
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

			{/* Enrollment Create Modal */}
			<EnrollmentCreateModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onSuccess={handleEnrollmentUpdate}
				cohortId={cohortId}
				cohortName={`${cohortName} - ${cohortLevel}`}
			/>

			{/* Enrollment Details Modal */}
			<EnrollmentDetailsModal
				enrollment={selectedEnrollment}
				isOpen={isModalOpen}
				onClose={handleModalClose}
				onUpdate={handleEnrollmentUpdate}
			/>
		</div>
	);
}
