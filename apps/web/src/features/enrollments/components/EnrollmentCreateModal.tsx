"use client";

import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { useDebounce } from "@uidotdev/usehooks";
import { AlertCircle, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EnrollmentCreateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
	cohortId?: string;
	cohortName?: string;
}

const statusOptions = [
	{ label: "Interested", value: "interested" },
	{ label: "Form Filled", value: "beginner_form_filled" },
	{ label: "Contract Signed", value: "contract_signed" },
	{ label: "Paid", value: "paid" },
	{ label: "Welcome Package Sent", value: "welcome_package_sent" },
	{ label: "Contract Abandoned", value: "contract_abandoned" },
	{ label: "Payment Abandoned", value: "payment_abandoned" },
	{ label: "Declined Contract", value: "declined_contract" },
	{ label: "Dropped Out", value: "dropped_out" },
];

export function EnrollmentCreateModal({
	isOpen,
	onClose,
	onSuccess,
	cohortId,
	cohortName,
}: EnrollmentCreateModalProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [students, setStudents] = useState<any[]>([]);
	const [loadingStudents, setLoadingStudents] = useState(false);
	const [studentPopoverOpen, setStudentPopoverOpen] = useState(false);
	const [studentSearch, setStudentSearch] = useState("");
	const debouncedStudentSearch = useDebounce(studentSearch, 300);

	// Form state
	const [selectedStudentId, setSelectedStudentId] = useState("");
	const [status, setStatus] = useState("interested");

	// Fetch students with search
	const fetchStudents = useCallback(async (searchTerm = "") => {
		setLoadingStudents(true);
		try {
			const queryParams = new URLSearchParams();
			if (searchTerm) {
				queryParams.append("search", searchTerm);
			}
			queryParams.append("limit", "20");

			const response = await fetch(`/api/students?${queryParams}`);
			if (response.ok) {
				const result = await response.json();
				const studentsList = result.data || [];
				// Filter to only show students with emails when searching
				const filteredStudents = searchTerm
					? studentsList.filter(
							(s: any) => s.email && s.full_name !== "Unknown",
						)
					: studentsList.filter((s: any) => s.full_name !== "Unknown");
				setStudents(filteredStudents);
			}
		} catch (error) {
			console.error("Error fetching students:", error);
			setStudents([]);
		} finally {
			setLoadingStudents(false);
		}
	}, []);

	// Trigger student search when debounced search changes
	useEffect(() => {
		if (studentPopoverOpen) {
			fetchStudents(debouncedStudentSearch);
		}
	}, [debouncedStudentSearch, studentPopoverOpen, fetchStudents]);

	// Reset form when modal opens/closes
	useEffect(() => {
		if (!isOpen) {
			setSelectedStudentId("");
			setStatus("interested");
			setStudentSearch("");
		}
	}, [isOpen]);

	const handleSubmit = async () => {
		if (!selectedStudentId || !cohortId) {
			toast.error("Please select a student");
			return;
		}

		setIsLoading(true);

		try {
			const payload = {
				studentId: selectedStudentId,
				cohortId: cohortId,
				status: status,
			};

			const response = await fetch("/api/enrollments", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create enrollment");
			}

			toast.success("Enrollment created successfully");

			if (onSuccess) {
				onSuccess();
			}

			onClose();
		} catch (error: any) {
			console.error("Error creating enrollment:", error);
			toast.error(error.message || "Failed to create enrollment");
		} finally {
			setIsLoading(false);
		}
	};

	const selectedStudent = students.find((s) => s.id === selectedStudentId);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Enroll Student</DialogTitle>
					<DialogDescription>
						Add a new student to{" "}
						{cohortName ? (
							<span className="font-medium text-foreground">{cohortName}</span>
						) : (
							"this cohort"
						)}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Student Selection */}
					<div className="space-y-2">
						<Label htmlFor="student">Student *</Label>
						<Popover
							open={studentPopoverOpen}
							onOpenChange={setStudentPopoverOpen}
						>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={studentPopoverOpen}
									className={cn(
										"h-10 w-full justify-between font-normal",
										!selectedStudentId && "text-muted-foreground",
									)}
									disabled={loadingStudents}
								>
									<span className="truncate">
										{selectedStudent ? selectedStudent.full_name : "Select student..."}
									</span>
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-[460px] p-0">
								<Command shouldFilter={false}>
									<CommandInput
										placeholder="Search by email..."
										value={studentSearch}
										onValueChange={setStudentSearch}
									/>
									{!studentSearch && (
										<div className="border-b p-2 text-muted-foreground text-sm">
											<AlertCircle className="mr-1 inline-block h-3 w-3" />
											Students without data will not be shown
										</div>
									)}
									<CommandEmpty>
										{loadingStudents
											? "Searching..."
											: studentSearch
												? "No students found with this email."
												: ""}
									</CommandEmpty>
									<CommandGroup className="max-h-64 overflow-auto">
										{students.length > 0 && studentSearch
											? students.map((student) => (
													<CommandItem
														key={student.id}
														value={student.id}
														onSelect={() => {
															setSelectedStudentId(student.id);
															setStudentPopoverOpen(false);
															setStudentSearch("");
														}}
													>
														<Check
															className={cn(
																"mr-2 h-4 w-4",
																selectedStudentId === student.id
																	? "opacity-100"
																	: "opacity-0",
															)}
														/>
														<div className="flex flex-col">
															<span>{student.full_name}</span>
															{student.email && (
																<span className="text-muted-foreground text-xs">
																	{student.email}
																</span>
															)}
														</div>
													</CommandItem>
												))
											: null}
									</CommandGroup>
									{students.length === 0 && !loadingStudents && studentSearch && (
										<div className="p-3 text-center text-muted-foreground text-xs">
											<AlertCircle className="mx-auto mb-1 h-4 w-4" />
											Note: Students with name "Unknown" will not be shown
										</div>
									)}
								</Command>
							</PopoverContent>
						</Popover>
						{selectedStudent && (
							<p className="text-muted-foreground text-xs">
								{selectedStudent.email && `${selectedStudent.email}`}
							</p>
						)}
					</div>

					{/* Status Selection */}
					<div className="space-y-2">
						<Label htmlFor="status">Enrollment Status *</Label>
						<Select value={status} onValueChange={setStatus}>
							<SelectTrigger className="h-10">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{statusOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<p className="text-muted-foreground text-xs">
							{status === "interested" &&
								"Student has shown interest but hasn't started the enrollment process."}
							{status === "beginner_form_filled" &&
								"Student has completed the initial assessment form."}
							{status === "contract_signed" &&
								"Student has signed the enrollment contract."}
							{status === "paid" &&
								"Payment has been received for this enrollment."}
							{status === "welcome_package_sent" &&
								"Welcome materials have been sent to the student."}
							{status === "dropped_out" &&
								"Student has discontinued their enrollment."}
							{status === "declined_contract" &&
								"Student decided not to proceed with the enrollment."}
							{status === "contract_abandoned" &&
								"Student started but didn't complete the contract process."}
							{status === "payment_abandoned" &&
								"Student signed the contract but didn't complete payment."}
						</p>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={isLoading}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isLoading || !selectedStudentId}>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Create Enrollment
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
