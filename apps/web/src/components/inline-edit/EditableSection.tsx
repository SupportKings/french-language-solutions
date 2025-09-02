"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Edit, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";

interface EditableSectionProps {
	title: string;
	children: (editing: boolean) => React.ReactNode;
	onSave?: () => Promise<void>;
	onCancel?: () => void;
	onEditStart?: () => void;
	className?: string;
	cardClassName?: string;
}

export function EditableSection({
	title,
	children,
	onSave,
	onCancel,
	onEditStart,
	className,
	cardClassName,
}: EditableSectionProps) {
	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);

	const handleSave = async () => {
		if (onSave) {
			setSaving(true);
			try {
				await onSave();
				setEditing(false);
				toast.success("Changes saved successfully");
			} catch (error) {
				toast.error("Failed to save changes");
			} finally {
				setSaving(false);
			}
		} else {
			setEditing(false);
		}
	};

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		}
		setEditing(false);
	};

	return (
		<Card className={cn("bg-background", cardClassName)}>
			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<CardTitle className="font-medium text-base">{title}</CardTitle>
					<div className="flex items-center gap-2">
						{editing ? (
							<>
								<Button
									size="sm"
									variant="ghost"
									onClick={handleCancel}
									disabled={saving}
									className="h-8"
								>
									<X className="mr-1 h-3.5 w-3.5" />
									Cancel
								</Button>
								<Button
									size="sm"
									onClick={handleSave}
									disabled={saving}
									className="h-8"
								>
									{saving ? (
										<Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
									) : (
										<Save className="mr-1 h-3.5 w-3.5" />
									)}
									Save
								</Button>
							</>
						) : (
							<Button
								size="sm"
								variant="ghost"
								onClick={() => {
									if (onEditStart) {
										onEditStart();
									}
									setEditing(true);
								}}
								className="h-8"
							>
								<Edit className="mr-1 h-3.5 w-3.5" />
								Edit
							</Button>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent className={className}>{children(editing)}</CardContent>
		</Card>
	);
}
