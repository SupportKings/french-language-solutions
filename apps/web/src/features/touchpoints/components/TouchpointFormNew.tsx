"use client";

import { useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

import {
	FormActions,
	FormContent,
	FormField,
	FormHeader,
	FormLayout,
	FormRow,
	FormSection,
	InfoBanner,
	InputField,
	SelectField,
	TextareaField,
} from "@/components/form-layout/FormLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
	CalendarIcon,
	Clock,
	FileText,
	Hand,
	Hash,
	Mail,
	MessageSquare,
	Phone,
	Send,
	User,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const touchpointFormSchema = z.object({
	student_id: z.string().min(1, "Student is required"),
	channel: z.enum(["sms", "call", "whatsapp", "email"]),
	type: z.enum(["inbound", "outbound"]),
	message: z.string().min(1, "Message content is required"),
	source: z.enum([
		"manual",
		"automated",
		"openphone",
		"gmail",
		"whatsapp_business",
		"webhook",
	]),
	occurred_at: z.date(),
	automated_follow_up_id: z.string().optional().or(z.literal("")),
	external_id: z.string().optional().or(z.literal("")),
	external_metadata: z.string().optional().or(z.literal("")),
});

type TouchpointFormValues = z.infer<typeof touchpointFormSchema>;

interface TouchpointFormNewProps {
	touchpoint?: any;
	studentId?: string;
	studentName?: string;
	redirectTo?: string;
	onSuccess?: () => void;
}

export function TouchpointFormNew({
	touchpoint,
	studentId: propsStudentId,
	studentName: propsStudentName,
	redirectTo,
	onSuccess,
}: TouchpointFormNewProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const [studentName, setStudentName] = useState<string>("");
	const isEditMode = !!touchpoint;

	// Get student info from props or URL params
	const studentId = propsStudentId || searchParams.get("studentId");
	const studentNameParam = propsStudentName || searchParams.get("studentName");

	const form = useForm<TouchpointFormValues>({
		resolver: zodResolver(touchpointFormSchema),
		defaultValues: {
			student_id: touchpoint?.student_id || studentId || "",
			channel: touchpoint?.channel || "email",
			type: touchpoint?.type || "outbound",
			message: touchpoint?.message || "",
			source: touchpoint?.source || "manual",
			occurred_at: touchpoint?.occurred_at
				? new Date(touchpoint.occurred_at)
				: new Date(),
			automated_follow_up_id: touchpoint?.automated_follow_up_id || "",
			external_id: touchpoint?.external_id || "",
			external_metadata: touchpoint?.external_metadata || "",
		},
	});

	// Set student name when component mounts or params change
	useEffect(() => {
		if (studentNameParam) {
			setStudentName(studentNameParam);
		}
	}, [studentNameParam]);

	async function onSubmit(values: TouchpointFormValues) {
		setIsLoading(true);

		try {
			const url = touchpoint
				? `/api/touchpoints/${touchpoint.id}`
				: "/api/touchpoints";

			const method = touchpoint ? "PATCH" : "POST";

			// Format dates for API
			const payload = {
				...values,
				occurred_at: format(values.occurred_at, "yyyy-MM-dd'T'HH:mm:ss"),
				// Clean up empty strings
				automated_follow_up_id: values.automated_follow_up_id || null,
				external_id: values.external_id || null,
				external_metadata: values.external_metadata || null,
			};

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to save touchpoint");
			}

			toast.success(
				touchpoint
					? "Touchpoint updated successfully"
					: "Touchpoint logged successfully",
			);

			if (onSuccess) {
				onSuccess();
			} else if (redirectTo) {
				router.push(redirectTo);
				router.refresh();
			} else {
				// Navigate back to student details if we have a student ID
				if (studentId) {
					router.push(`/admin/students/${studentId}?tab=touchpoints`);
				} else {
					router.push("/admin/touchpoints");
				}
				router.refresh();
			}
		} catch (error) {
			console.error("Error saving touchpoint:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to save touchpoint",
			);
		} finally {
			setIsLoading(false);
		}
	}

	const handleCancel = () => {
		if (redirectTo) {
			router.push(redirectTo);
		} else if (studentId) {
			router.push(`/admin/students/${studentId}?tab=touchpoints`);
		} else {
			router.push("/admin/touchpoints");
		}
	};

	const channels = [
		{ label: "📧 Email", value: "email" },
		{ label: "📱 SMS", value: "sms" },
		{ label: "📞 Call", value: "call" },
		{ label: "💬 WhatsApp", value: "whatsapp" },
	];

	const types = [
		{ label: "➡️ Outbound (From Us)", value: "outbound" },
		{ label: "⬅️ Inbound (From Student)", value: "inbound" },
	];

	const sources = [
		{ label: "Manual Entry", value: "manual" },
		{ label: "Automated System", value: "automated" },
		{ label: "OpenPhone", value: "openphone" },
		{ label: "Gmail", value: "gmail" },
		{ label: "WhatsApp Business", value: "whatsapp_business" },
		{ label: "Webhook", value: "webhook" },
	];

	return (
		<FormLayout>
			<FormHeader
				backUrl={
					redirectTo ||
					(studentId ? `/admin/students/${studentId}` : "/admin/touchpoints")
				}
				backLabel={
					redirectTo
						? "Back"
						: studentId
							? studentName || "Student Details"
							: "Touchpoints"
				}
				title={isEditMode ? "Edit Touchpoint" : "Log Touchpoint"}
				subtitle={
					isEditMode
						? "Update touchpoint details"
						: studentName
							? `Record a communication with ${studentName}`
							: "Record a student communication"
				}
				badge={
					isEditMode ? { label: "Editing", variant: "warning" } : undefined
				}
			/>

			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormContent>
					<div className="space-y-4">
						{/* Info Banner */}
						{!isEditMode && (
							<InfoBanner
								variant="info"
								title="Communication Tracking"
								message="Log all interactions with students to maintain a complete communication history. This helps track engagement and follow-up effectiveness."
							/>
						)}

						{/* Communication Details */}
						<FormSection
							title="Communication Details"
							description="Basic information about this interaction"
							icon={MessageSquare}
							required
						>
							{/* Show student selector only if no student ID in params */}
							{!studentId && (
								<FormField
									label="Student"
									required
									error={form.formState.errors.student_id?.message}
								>
									<InputField
										placeholder="Enter student ID"
										error={!!form.formState.errors.student_id}
										{...form.register("student_id")}
									/>
								</FormField>
							)}

							<FormRow>
								<FormField
									label="Channel"
									required
									error={form.formState.errors.channel?.message}
								>
									<SelectField
										value={form.watch("channel")}
										onValueChange={(value) =>
											form.setValue("channel", value as any)
										}
										options={channels}
									/>
								</FormField>
								<FormField
									label="Direction"
									required
									error={form.formState.errors.type?.message}
								>
									<SelectField
										value={form.watch("type")}
										onValueChange={(value) =>
											form.setValue("type", value as any)
										}
										options={types}
									/>
								</FormField>
							</FormRow>

							<FormRow>
								<FormField
									label="Source"
									hint="How was this communication logged?"
									error={form.formState.errors.source?.message}
								>
									<SelectField
										value={form.watch("source")}
										onValueChange={(value) =>
											form.setValue("source", value as any)
										}
										options={sources}
									/>
								</FormField>
								<FormField
									label="Date & Time"
									error={form.formState.errors.occurred_at?.message}
								>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className={cn(
													"h-9 w-full justify-start text-left font-normal",
													!form.watch("occurred_at") && "text-muted-foreground",
												)}
											>
												<CalendarIcon className="mr-2 h-4 w-4" />
												{form.watch("occurred_at") ? (
													format(form.watch("occurred_at"), "PPP 'at' HH:mm")
												) : (
													<span>Pick a date</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={form.watch("occurred_at")}
												onSelect={(date) => {
													if (date) {
														// Preserve the time from the current value
														const currentTime = form.watch("occurred_at");
														date.setHours(currentTime.getHours());
														date.setMinutes(currentTime.getMinutes());
														form.setValue("occurred_at", date);
													}
												}}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
								</FormField>
							</FormRow>
						</FormSection>

						{/* Message Content */}
						<FormSection
							title="Message Content"
							description="The actual communication content"
							icon={FileText}
							required
						>
							<FormField
								label="Message"
								required
								hint="Describe the communication or paste the message content"
								error={form.formState.errors.message?.message}
							>
								<TextareaField
									placeholder="Enter the message content or summary of the conversation..."
									className="min-h-[120px]"
									error={!!form.formState.errors.message}
									{...form.register("message")}
								/>
							</FormField>
						</FormSection>

						{/* Optional Metadata */}
						<FormSection
							title="Additional Information"
							description="Optional tracking and integration data"
							icon={Hash}
						>
							<FormRow>
								<FormField
									label="External ID"
									hint="ID from external system (OpenPhone, etc.)"
									error={form.formState.errors.external_id?.message}
								>
									<InputField
										placeholder="External reference"
										{...form.register("external_id")}
									/>
								</FormField>
							</FormRow>

							<FormField
								label="Metadata"
								hint="Additional JSON data or notes"
								error={form.formState.errors.external_metadata?.message}
							>
								<TextareaField
									placeholder='{"key": "value"}'
									className="font-mono text-sm"
									{...form.register("external_metadata")}
								/>
							</FormField>
						</FormSection>
					</div>
				</FormContent>

				<FormActions
					primaryLabel={isEditMode ? "Update Touchpoint" : "Log Touchpoint"}
					primaryLoading={isLoading}
					primaryDisabled={isLoading}
					primaryType="submit"
					secondaryLabel="Cancel"
					onSecondaryClick={handleCancel}
				/>
			</form>
		</FormLayout>
	);
}
