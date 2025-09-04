import { useState } from "react";

import type { Database } from "@/utils/supabase/database.types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";

import { format } from "date-fns";
import { Edit3, FileText, Save, X } from "lucide-react";

type EnrollmentStatus = Database["public"]["Enums"]["enrollment_status"];

interface EnrollmentBasicInfoProps {
	enrollment: {
		status: EnrollmentStatus;
		created_at: string;
	};
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

export function EnrollmentBasicInfo({
	enrollment,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel,
}: EnrollmentBasicInfoProps) {
	const [formData, setFormData] = useState({
		status: enrollment.status,
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			status: enrollment.status,
		});
		onCancel?.();
	};

	const enrollmentStatuses: EnrollmentStatus[] = [
		"declined_contract",
		"dropped_out",
		"interested",
		"beginner_form_filled",
		"contract_abandoned",
		"contract_signed",
		"payment_abandoned",
		"paid",
		"welcome_package_sent",
	];

	const getStatusLabel = (status: EnrollmentStatus) => {
		return status
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Enrollment Details
					</div>
					{!isEditing ? (
						<Button
							variant="ghost"
							size="sm"
							onClick={onEditToggle}
							className="h-8 w-8 p-0"
						>
							<Edit3 className="h-4 w-4" />
						</Button>
					) : (
						<div className="flex gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={handleSave}
								className="h-8 w-8 p-0"
							>
								<Save className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleCancel}
								className="h-8 w-8 p-0"
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Status
					</label>
					{isEditing ? (
						<Select
							value={formData.status}
							onValueChange={(value) =>
								setFormData((prev) => ({
									...prev,
									status: value as EnrollmentStatus,
								}))
							}
						>
							<SelectTrigger className="mt-1">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{enrollmentStatuses.map((status) => (
									<SelectItem key={status} value={status}>
										{getStatusLabel(status)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm">
							<StatusBadge>{getStatusLabel(enrollment.status)}</StatusBadge>
						</p>
					)}
				</div>
				<div>
					<label className="font-medium text-muted-foreground text-sm">
						Created At
					</label>
					<p className="text-sm">{formatDate(enrollment.created_at)}</p>
				</div>
			</CardContent>
		</Card>
	);
}
