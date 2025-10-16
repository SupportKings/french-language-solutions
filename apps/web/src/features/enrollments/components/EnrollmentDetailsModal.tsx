"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { format } from "date-fns";
import { Clock, Loader2, Mail, User } from "lucide-react";
import { toast } from "sonner";

interface EnrollmentDetailsModalProps {
	enrollment: any;
	isOpen: boolean;
	onClose: () => void;
	onUpdate?: () => void;
}

const statusOptions = [
	{
		value: "interested",
		label: "Interested",
		color: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
	},
	{
		value: "beginner_form_filled",
		label: "Form Filled",
		color: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
	},
	{
		value: "contract_signed",
		label: "Contract Signed",
		color: "bg-purple-500/10 text-purple-700 border-purple-200",
	},
	{
		value: "paid",
		label: "Paid",
		color: "bg-green-500/10 text-green-700 border-green-200",
	},
	{
		value: "welcome_package_sent",
		label: "Welcome Package Sent",
		color: "bg-blue-500/10 text-blue-700 border-blue-200",
	},
	{
		value: "transitioning",
		label: "Transitioning",
		color: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
	},
	{
		value: "offboarding",
		label: "Offboarding",
		color: "bg-orange-500/10 text-orange-700 border-orange-200",
	},
	{
		value: "payment_abandoned",
		label: "Payment Abandoned",
		color: "bg-orange-500/10 text-orange-700 border-orange-200",
	},
	{
		value: "contract_abandoned",
		label: "Contract Abandoned",
		color: "bg-orange-500/10 text-orange-700 border-orange-200",
	},
	{
		value: "declined_contract",
		label: "Declined Contract",
		color: "bg-red-500/10 text-red-700 border-red-200",
	},
	{
		value: "dropped_out",
		label: "Dropped Out",
		color: "bg-red-500/10 text-red-700 border-red-200",
	},
];

export function EnrollmentDetailsModal({
	enrollment,
	isOpen,
	onClose,
	onUpdate,
}: EnrollmentDetailsModalProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [formData, setFormData] = useState({
		status: enrollment?.status || "interested",
	});

	// Reset form data when enrollment changes
	useEffect(() => {
		if (enrollment) {
			setFormData({
				status: enrollment.status || "interested",
			});
			setIsEditing(false);
		}
	}, [enrollment]);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			const response = await fetch(`/api/enrollments/${enrollment.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				throw new Error("Failed to update enrollment");
			}

			toast.success("Enrollment updated successfully");
			setIsEditing(false);
			if (onUpdate) {
				onUpdate();
			}
			// Close the modal after successful update
			onClose();
		} catch (error) {
			toast.error("Failed to update enrollment");
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		setFormData({
			status: enrollment?.status || "interested",
		});
		setIsEditing(false);
	};

	if (!enrollment) return null;

	const student = enrollment.students;
	const enrollmentDate = enrollment.created_at
		? new Date(enrollment.created_at)
		: null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Enrollment Details</DialogTitle>
					<DialogDescription>
						View and manage enrollment information
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Student Information */}
					<div className="rounded-lg border bg-muted/30 p-4">
						<div className="flex items-start gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
								<User className="h-5 w-5 text-primary" />
							</div>
							<div className="flex-1">
								<p className="font-medium">
									{student?.full_name || "Unknown Student"}
								</p>
								{student?.email && (
									<p className="mt-1 flex items-center gap-1 text-muted-foreground text-sm">
										<Mail className="h-3 w-3" />
										{student.email}
									</p>
								)}
							</div>
						</div>
					</div>

					{/* Enrollment Status */}
					<div className="space-y-3">
						<h3 className="font-medium text-sm">Enrollment Information</h3>
						<div className="space-y-3">
							{isEditing ? (
								<div className="space-y-2">
									<Label htmlFor="status">Status</Label>
									<Select
										value={formData.status}
										onValueChange={(value) =>
											setFormData({ ...formData, status: value })
										}
									>
										<SelectTrigger id="status">
											<SelectValue placeholder="Select status" />
										</SelectTrigger>
										<SelectContent>
											{statusOptions.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							) : (
								<>
									<div className="grid grid-cols-2 gap-3">
										<div>
											<Label className="text-muted-foreground text-xs">
												Status
											</Label>
											<div className="mt-1">
												{(() => {
													const statusOption = statusOptions.find(
														(opt) => opt.value === enrollment.status,
													);
													return (
														<Badge
															variant="outline"
															className={`${
																statusOption?.color ||
																"border-gray-200 bg-gray-500/10 text-gray-700"
															}`}
														>
															{statusOption?.label ||
																enrollment.status
																	?.replace(/_/g, " ")
																	.replace(/\b\w/g, (l: string) =>
																		l.toUpperCase(),
																	)}
														</Badge>
													);
												})()}
											</div>
										</div>
										<div>
											<Label className="text-muted-foreground text-xs">
												Enrolled Date
											</Label>
											<p className="mt-1 flex items-center gap-1 font-medium text-sm">
												<Clock className="h-3 w-3 text-muted-foreground" />
												{enrollmentDate
													? format(enrollmentDate, "MMM d, yyyy")
													: "Unknown"}
											</p>
										</div>
									</div>
								</>
							)}
						</div>
					</div>
				</div>

				<DialogFooter>
					{isEditing ? (
						<>
							<Button
								variant="outline"
								onClick={handleCancel}
								disabled={isSaving}
							>
								Cancel
							</Button>
							<Button onClick={handleSave} disabled={isSaving}>
								{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{isSaving ? "Saving..." : "Save Changes"}
							</Button>
						</>
					) : (
						<>
							<Button variant="outline" onClick={onClose}>
								Close
							</Button>
							<Button onClick={() => setIsEditing(true)}>Edit Details</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
