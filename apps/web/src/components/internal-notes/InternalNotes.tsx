"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Edit2, X, Save } from "lucide-react";
import { RichTextEditor } from "@/components/rich-text-editor/RichTextEditor";
import { toast } from "sonner";

interface InternalNotesProps {
	initialContent: any;
	onSave: (content: any) => Promise<void>;
	canEdit: boolean;
	entityType: "enrollment" | "cohort" | "student";
}

export function InternalNotes({
	initialContent,
	onSave,
	canEdit,
	entityType,
}: InternalNotesProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [content, setContent] = useState(initialContent);
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await onSave(content);
			setIsEditing(false);
			toast.success("Internal notes saved successfully");
		} catch (error) {
			toast.error("Failed to save internal notes");
			console.error("Error saving internal notes:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		setContent(initialContent);
		setIsEditing(false);
	};

	const isEmpty =
		!content ||
		(typeof content === "object" &&
			(!content.content || content.content.length === 0));

	return (
		<Card className="overflow-hidden bg-card/95 backdrop-blur-sm border-border/50 rounded-2xl shadow-md">
			<div className="border-b bg-muted/30 px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<FileText className="h-5 w-5 text-muted-foreground" />
						<h2 className="font-semibold text-base">Internal Notes</h2>
					</div>
					{canEdit && !isEditing && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => setIsEditing(true)}
						>
							<Edit2 className="mr-2 h-3.5 w-3.5" />
							Edit Notes
						</Button>
					)}
					{isEditing && (
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={handleCancel}
								disabled={isSaving}
							>
								<X className="mr-2 h-3.5 w-3.5" />
								Cancel
							</Button>
							<Button size="sm" onClick={handleSave} disabled={isSaving}>
								<Save className="mr-2 h-3.5 w-3.5" />
								{isSaving ? "Saving..." : "Save"}
							</Button>
						</div>
					)}
				</div>
			</div>

			<div className="p-6">
				{isEditing ? (
					<RichTextEditor
						content={content}
						onChange={setContent}
						placeholder="Add internal notes here... These are only visible to staff members."
						editable={true}
					/>
				) : isEmpty ? (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<FileText className="mb-3 h-12 w-12 text-muted-foreground/40" />
						<p className="text-muted-foreground text-sm">
							No internal notes yet
						</p>
						{canEdit && (
							<Button
								variant="link"
								size="sm"
								className="mt-2"
								onClick={() => setIsEditing(true)}
							>
								Add internal notes
							</Button>
						)}
					</div>
				) : (
					<div className="[&_.ProseMirror]:cursor-default">
						<RichTextEditor
							content={content}
							onChange={() => {}}
							editable={false}
						/>
					</div>
				)}
			</div>
		</Card>
	);
}