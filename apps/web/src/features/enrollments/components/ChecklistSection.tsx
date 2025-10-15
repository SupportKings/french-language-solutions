"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

import {
	ENROLLMENT_CHECKLIST_LABELS,
	OFFBOARDING_CHECKLIST_LABELS,
	TRANSITION_CHECKLIST_LABELS,
	calculateChecklistProgress,
	type EnrollmentChecklist,
	type OffboardingChecklist,
	type TransitionChecklist,
} from "../types/checklist.types";

import { format } from "date-fns";
import {
	AlertCircle,
	Calendar,
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	ClipboardList,
	ExternalLink,
	User,
} from "lucide-react";
import { toast } from "sonner";
import { updateChecklistAction } from "../actions/updateChecklist";

type ChecklistType = "enrollment" | "transition" | "offboarding";

interface ChecklistSectionProps {
	type: ChecklistType;
	checklist:
		| EnrollmentChecklist
		| TransitionChecklist
		| OffboardingChecklist
		| null;
	enrollmentId: string;
	onUpdate?: () => void;
	canEdit?: boolean;
}

export function ChecklistSection({
	type,
	checklist,
	enrollmentId,
	onUpdate,
	canEdit = true,
}: ChecklistSectionProps) {
	const [isExpanded, setIsExpanded] = useState(true);
	const [isSaving, setIsSaving] = useState(false);

	// Get the appropriate labels based on type
	const getLabels = () => {
		switch (type) {
			case "enrollment":
				return ENROLLMENT_CHECKLIST_LABELS;
			case "transition":
				return TRANSITION_CHECKLIST_LABELS;
			case "offboarding":
				return OFFBOARDING_CHECKLIST_LABELS;
		}
	};

	const getTitle = () => {
		switch (type) {
			case "enrollment":
				return "Enrollment Checklist";
			case "transition":
				return "Transition Checklist";
			case "offboarding":
				return "Offboarding Checklist";
		}
	};

	if (!checklist) {
		return null;
	}

	const labels = getLabels();
	const progress = calculateChecklistProgress(checklist);

	const handleToggleItem = async (itemKey: string, currentValue: boolean) => {
		if (!canEdit) {
			toast.error("You don't have permission to update the checklist");
			return;
		}

		setIsSaving(true);
		try {
			const result = await updateChecklistAction({
				enrollmentId,
				checklistType: type,
				itemKey,
				updates: {
					completed: !currentValue,
				},
			});

			if (result?.validationErrors) {
				const errorMessages: string[] = [];
				if (result.validationErrors._errors) {
					errorMessages.push(...result.validationErrors._errors);
				}
				if (errorMessages.length > 0) {
					errorMessages.forEach((error) => toast.error(error));
				} else {
					toast.error("Failed to update checklist");
				}
				return;
			}

			if (result?.data?.success) {
				toast.success("Checklist updated");
				onUpdate?.();
			} else {
				toast.error("Failed to update checklist");
			}
		} catch (error) {
			console.error("Error updating checklist:", error);
			toast.error("Failed to update checklist");
		} finally {
			setIsSaving(false);
		}
	};

	const handleUpdateReviewLink = async (itemKey: string, link: string) => {
		if (!canEdit) {
			toast.error("You don't have permission to update the checklist");
			return;
		}

		setIsSaving(true);
		try {
			const result = await updateChecklistAction({
				enrollmentId,
				checklistType: type,
				itemKey,
				updates: {
					review_link: link || null,
				},
			});

			if (result?.data?.success) {
				toast.success("Review link updated");
				onUpdate?.();
			} else {
				toast.error("Failed to update review link");
			}
		} catch (error) {
			console.error("Error updating review link:", error);
			toast.error("Failed to update review link");
		} finally {
			setIsSaving(false);
		}
	};

	const handleUpdateLastClassDate = async (itemKey: string, date: string) => {
		if (!canEdit) {
			toast.error("You don't have permission to update the checklist");
			return;
		}

		setIsSaving(true);
		try {
			const result = await updateChecklistAction({
				enrollmentId,
				checklistType: type,
				itemKey,
				updates: {
					last_class_date: date || null,
				},
			});

			if (result?.data?.success) {
				toast.success("Last class date updated");
				onUpdate?.();
			} else {
				toast.error("Failed to update date");
			}
		} catch (error) {
			console.error("Error updating last class date:", error);
			toast.error("Failed to update date");
		} finally {
			setIsSaving(false);
		}
	};

	const handleUpdateTeacherNotified = async (
		itemKey: string,
		field: "old_teacher_notified" | "new_teacher_notified",
		value: boolean,
	) => {
		if (!canEdit) {
			toast.error("You don't have permission to update the checklist");
			return;
		}

		setIsSaving(true);
		try {
			const result = await updateChecklistAction({
				enrollmentId,
				checklistType: type,
				itemKey,
				updates: {
					[field]: value,
				},
			});

			if (result?.data?.success) {
				toast.success("Teacher notification updated");
				onUpdate?.();
			} else {
				toast.error("Failed to update");
			}
		} catch (error) {
			console.error("Error updating teacher notification:", error);
			toast.error("Failed to update");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<ClipboardList className="h-5 w-5 text-muted-foreground" />
						<div>
							<CardTitle className="text-lg">{getTitle()}</CardTitle>
							<div className="mt-1 flex items-center gap-2">
								<span className="text-muted-foreground text-sm">
									{progress.requiredCompleted} of {progress.requiredTotal} required
									completed
								</span>
								<Badge
									variant={progress.percentage === 100 ? "success" : "secondary"}
									className="text-xs"
								>
									{progress.percentage}%
								</Badge>
							</div>
						</div>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsExpanded(!isExpanded)}
					>
						{isExpanded ? (
							<ChevronUp className="h-4 w-4" />
						) : (
							<ChevronDown className="h-4 w-4" />
						)}
					</Button>
				</div>
				<Progress value={progress.percentage} className="mt-3 h-2" />
			</CardHeader>

			{isExpanded && (
				<CardContent>
					<div className="space-y-2">
						{Object.entries(checklist).map(([key, item]) => {
							const label = labels[key as keyof typeof labels];
							const isDeprecated =
								"deprecated" in item ? item.deprecated : false;

							return (
								<div
									key={key}
									className={`flex items-start gap-2 rounded-md border px-3 py-2 transition-colors ${
										item.completed
											? "border-green-200 bg-green-50/50"
											: "border-border/50 bg-background hover:bg-muted/30"
									} ${isDeprecated ? "opacity-60" : ""}`}
								>
									<Checkbox
										id={`checklist-${key}`}
										checked={item.completed}
										onCheckedChange={() =>
											handleToggleItem(key, item.completed)
										}
										disabled={!canEdit || isSaving}
										className="mt-0.5 h-4 w-4"
									/>
									<div className="flex-1 space-y-1.5">
										<div className="flex items-start justify-between gap-2">
											<Label
												htmlFor={`checklist-${key}`}
												className={`cursor-pointer text-sm leading-snug ${
													item.completed ? "line-through text-muted-foreground" : ""
												}`}
											>
												{label}
												{!item.required && (
													<span className="ml-1.5 text-muted-foreground text-xs">
														(Optional)
													</span>
												)}
												{isDeprecated && (
													<Badge variant="secondary" className="ml-1.5 text-[10px] px-1 py-0">
														Deprecated
													</Badge>
												)}
											</Label>
											{item.completed && (
												<CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600 mt-0.5" />
											)}
										</div>

										{/* Show note if available */}
										{item.note && !item.completed && (
											<p className="text-muted-foreground text-[11px] leading-tight">
												{item.note}
											</p>
										)}

										{/* Special fields for specific items */}
										{key === "last_class_before_switch" &&
											"last_class_date" in item && (
												<div className="flex items-center gap-1.5">
													<Calendar className="h-3 w-3 text-muted-foreground" />
													<Input
														type="date"
														value={
															item.last_class_date
																? new Date(item.last_class_date)
																		.toISOString()
																		.split("T")[0]
																: ""
														}
														onChange={(e) =>
															handleUpdateLastClassDate(key, e.target.value)
														}
														disabled={!canEdit || isSaving}
														className="h-7 max-w-[180px] text-xs"
													/>
												</div>
											)}

										{key === "both_teachers_notified" &&
											"old_teacher_notified" in item && (
												<div className="flex flex-col gap-1">
													<div className="flex items-center gap-1.5">
														<Checkbox
															id={`${key}-old`}
															checked={item.old_teacher_notified || false}
															onCheckedChange={(checked) =>
																handleUpdateTeacherNotified(
																	key,
																	"old_teacher_notified",
																	checked as boolean,
																)
															}
															disabled={!canEdit || isSaving}
															className="h-3 w-3"
														/>
														<Label
															htmlFor={`${key}-old`}
															className="text-[11px] cursor-pointer"
														>
															Old teacher notified
														</Label>
													</div>
													<div className="flex items-center gap-1.5">
														<Checkbox
															id={`${key}-new`}
															checked={item.new_teacher_notified || false}
															onCheckedChange={(checked) =>
																handleUpdateTeacherNotified(
																	key,
																	"new_teacher_notified",
																	checked as boolean,
																)
															}
															disabled={!canEdit || isSaving}
															className="h-3 w-3"
														/>
														<Label
															htmlFor={`${key}-new`}
															className="text-[11px] cursor-pointer"
														>
															New teacher notified
														</Label>
													</div>
												</div>
											)}

										{key === "review_received" && "review_link" in item && (
											<div className="flex items-center gap-1.5">
												<Input
													type="url"
													placeholder="Review link (optional)"
													value={item.review_link || ""}
													onChange={(e) =>
														handleUpdateReviewLink(key, e.target.value)
													}
													disabled={!canEdit || isSaving}
													className="h-7 flex-1 text-xs"
												/>
												{item.review_link && (
													<Button
														variant="ghost"
														size="sm"
														className="h-7 w-7 p-0"
														asChild
													>
														<a
															href={item.review_link}
															target="_blank"
															rel="noopener noreferrer"
														>
															<ExternalLink className="h-3 w-3" />
														</a>
													</Button>
												)}
											</div>
										)}

										{/* Show completion info */}
										{item.completed && item.completed_at && (
											<div className="flex items-center gap-1 text-muted-foreground text-[10px]">
												<User className="h-2.5 w-2.5" />
												<span>
													{format(new Date(item.completed_at), "MMM d, yyyy")}
												</span>
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>

					{/* Summary footer */}
					<div className="mt-4 rounded-lg border bg-muted/30 p-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-sm">
								<ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
								<span className="font-medium text-xs">Progress Summary</span>
							</div>
							<div className="text-right">
								<p className="font-medium text-xs">
									{progress.requiredCompleted}/{progress.requiredTotal} Required
								</p>
								<p className="text-muted-foreground text-[10px]">
									{progress.completed}/{progress.total} Total
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			)}
		</Card>
	);
}
