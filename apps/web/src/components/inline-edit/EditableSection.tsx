"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Save, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EditableSectionProps {
	title: string;
	children: (editing: boolean) => React.ReactNode;
	onSave?: () => Promise<void>;
	className?: string;
	cardClassName?: string;
}

export function EditableSection({
	title,
	children,
	onSave,
	className,
	cardClassName
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
		setEditing(false);
	};

	return (
		<Card className={cn("bg-background", cardClassName)}>
			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base font-medium">{title}</CardTitle>
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
									<X className="h-3.5 w-3.5 mr-1" />
									Cancel
								</Button>
								<Button
									size="sm"
									onClick={handleSave}
									disabled={saving}
									className="h-8"
								>
									{saving ? (
										<Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
									) : (
										<Save className="h-3.5 w-3.5 mr-1" />
									)}
									Save
								</Button>
							</>
						) : (
							<Button
								size="sm"
								variant="ghost"
								onClick={() => setEditing(true)}
								className="h-8"
							>
								<Edit className="h-3.5 w-3.5 mr-1" />
								Edit
							</Button>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent className={className}>
				{children(editing)}
			</CardContent>
		</Card>
	);
}