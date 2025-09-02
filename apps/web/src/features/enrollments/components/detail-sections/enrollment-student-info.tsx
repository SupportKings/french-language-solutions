import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useState } from "react";
import { Edit3, Save, X, User } from "lucide-react";
import type { Database } from "@/utils/supabase/database.types";

type CommunicationChannel = Database["public"]["Enums"]["communication_channel"];

interface EnrollmentStudentInfoProps {
	student: any;
	isEditing?: boolean;
	onEditToggle?: () => void;
	onSave?: (data: any) => void;
	onCancel?: () => void;
}

export function EnrollmentStudentInfo({
	student,
	isEditing = false,
	onEditToggle,
	onSave,
	onCancel
}: EnrollmentStudentInfoProps) {
	const [formData, setFormData] = useState({
		full_name: student?.full_name || "",
		email: student?.email || "",
		mobile_phone_number: student?.mobile_phone_number || "",
		city: student?.city || "",
		communication_channel: student?.communication_channel || "email",
	});

	const handleSave = () => {
		onSave?.(formData);
	};

	const handleCancel = () => {
		// Reset form data to original values
		setFormData({
			full_name: student?.full_name || "",
			email: student?.email || "",
			mobile_phone_number: student?.mobile_phone_number || "",
			city: student?.city || "",
			communication_channel: student?.communication_channel || "email",
		});
		onCancel?.();
	};

	const communicationChannels: CommunicationChannel[] = ["sms_email", "email", "sms"];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Student Details
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
					<label htmlFor="student-fullname" className="font-medium text-muted-foreground text-sm">
						Full Name
					</label>
					{isEditing ? (
						<Input
							id="student-fullname"
							value={formData.full_name}
							onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{student?.full_name || "Not provided"}</p>
					)}
				</div>
				<div>
					<label htmlFor="student-email" className="font-medium text-muted-foreground text-sm">
						Email
					</label>
					{isEditing ? (
						<Input
							id="student-email"
							type="email"
							value={formData.email}
							onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{student?.email || "Not provided"}</p>
					)}
				</div>
				<div>
					<label htmlFor="student-phone" className="font-medium text-muted-foreground text-sm">
						Phone Number
					</label>
					{isEditing ? (
						<Input
							id="student-phone"
							value={formData.mobile_phone_number}
							onChange={(e) => setFormData(prev => ({ ...prev, mobile_phone_number: e.target.value }))}
							placeholder="Enter phone number"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{student?.mobile_phone_number || "Not provided"}</p>
					)}
				</div>
				<div>
					<label htmlFor="student-city" className="font-medium text-muted-foreground text-sm">
						City
					</label>
					{isEditing ? (
						<Input
							id="student-city"
							value={formData.city}
							onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
							placeholder="Enter city"
							className="mt-1"
						/>
					) : (
						<p className="text-sm">{student?.city || "Not provided"}</p>
					)}
				</div>
				<div>
					<label htmlFor="student-communication-channel" className="font-medium text-muted-foreground text-sm">
						Communication Channel
					</label>
					{isEditing ? (
						<Select
							value={formData.communication_channel}
							onValueChange={(value) => setFormData(prev => ({ ...prev, communication_channel: value as CommunicationChannel }))}
						>
							<SelectTrigger id="student-communication-channel" className="mt-1">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="sms_email">SMS & Email</SelectItem>
								<SelectItem value="email">Email Only</SelectItem>
								<SelectItem value="sms">SMS Only</SelectItem>
							</SelectContent>
						</Select>
					) : (
						<p className="text-sm">
							{student?.communication_channel === "sms_email" ? "SMS & Email" :
							 student?.communication_channel === "email" ? "Email Only" :
							 student?.communication_channel === "sms" ? "SMS Only" : "Not specified"}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}