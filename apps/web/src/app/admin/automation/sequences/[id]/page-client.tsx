"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { BackButton } from "@/components/ui/back-button";
import { EditableSection } from "@/components/inline-edit/EditableSection";
import { InlineEditField } from "@/components/inline-edit/InlineEditField";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { SequenceMessageModal } from "@/features/sequences/components/SequenceMessageModal";
import { SequenceMessagesSection } from "@/features/sequences/components/SequenceMessagesSection";
import {
	useDeleteSequence,
	useSequence,
} from "@/features/sequences/queries/sequences.queries";

import { format } from "date-fns";
import {
	Activity,
	Bot,
	ChevronRight,
	Clock,
	Copy,
	FileText,
	Layers,
	Mail,
	MessageSquare,
	MoreVertical,
	Plus,
	Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface SequenceDetailPageClientProps {
	sequenceId: string;
}

// Format delay for display
function formatDelay(minutes: number): string {
	if (minutes === 0) return "Immediately";
	if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
	if (minutes < 1440) {
		const hours = Math.floor(minutes / 60);
		return `${hours} hour${hours !== 1 ? "s" : ""}`;
	}
	const days = Math.floor(minutes / 1440);
	return `${days} day${days !== 1 ? "s" : ""}`;
}

export function SequenceDetailPageClient({
	sequenceId,
}: SequenceDetailPageClientProps) {
	const router = useRouter();
	const {
		data: sequenceData,
		isLoading,
		error,
		isSuccess,
	} = useSequence(sequenceId);
	const [sequence, setSequence] = useState<any>(null);
	const [editedSequence, setEditedSequence] = useState<any>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [messageModalOpen, setMessageModalOpen] = useState(false);
	const [messageToEdit, setMessageToEdit] = useState<any>(null);

	const deleteSequenceMutation = useDeleteSequence();

	// Update the sequence when data changes
	useEffect(() => {
		if (sequenceData) {
			setSequence(sequenceData);
			setEditedSequence(sequenceData);
		}
	}, [sequenceData]);

	// Update edited sequence field locally
	const updateEditedField = async (field: string, value: any) => {
		setEditedSequence({
			...editedSequence,
			[field]: value,
		});
		return Promise.resolve();
	};

	// Save all changes to the API
	const saveAllChanges = async () => {
		try {
			const changes: any = {};

			// Check for changes in basic fields
			if (editedSequence.display_name !== sequence.display_name) {
				changes.display_name = editedSequence.display_name;
			}
			if (editedSequence.subject !== sequence.subject) {
				changes.subject = editedSequence.subject;
			}

			// If no changes, return early
			if (Object.keys(changes).length === 0) {
				return;
			}

			const response = await fetch(`/api/sequences/${sequenceId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(changes),
			});

			if (!response.ok) throw new Error("Failed to update");

			const updated = await response.json();
			setSequence(updated);
			setEditedSequence(updated);
			toast.success("Changes saved successfully");
		} catch (error) {
			toast.error("Failed to save changes");
			throw error;
		}
	};

	// Delete sequence
	const handleDeleteSequence = async () => {
		setIsDeleting(true);
		try {
			await deleteSequenceMutation.mutateAsync(sequenceId);
			toast.success("Sequence deleted successfully");
			// Navigate back to the list - the mutation will invalidate the cache
			router.push("/admin/automation/sequences");
		} catch (error: any) {
			toast.error(error.message || "Failed to delete sequence");
		} finally {
			setIsDeleting(false);
			setShowDeleteConfirm(false);
		}
	};

	// Open message modal for create
	const navigateToAddMessage = () => {
		setMessageToEdit(null);
		setMessageModalOpen(true);
	};

	// Open message modal for edit
	const handleEditMessage = (message: any) => {
		setMessageToEdit(message);
		setMessageModalOpen(true);
	};

	// Show loading skeleton while loading
	if (isLoading) {
		return (
			<div className="min-h-screen bg-background">
				{/* Header Skeleton */}
				<div className="border-b bg-background">
					<div className="px-10 py-4">
						<div className="animate-pulse">
							<div className="mb-2 flex items-center gap-2">
								<div className="h-4 w-16 rounded bg-muted" />
								<div className="h-3 w-3 rounded bg-muted" />
								<div className="h-4 w-24 rounded bg-muted" />
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-full bg-muted" />
									<div>
										<div className="mb-2 h-6 w-32 rounded bg-muted" />
										<div className="flex items-center gap-2">
											<div className="h-4 w-20 rounded bg-muted" />
											<div className="h-4 w-16 rounded bg-muted" />
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<div className="h-9 w-32 rounded bg-muted" />
									<div className="h-9 w-9 rounded bg-muted" />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Content Skeleton */}
				<div className="space-y-6 px-10 py-6">
					<div className="rounded-lg border bg-card p-8">
						<div className="animate-pulse space-y-4">
							<div className="h-5 w-40 rounded bg-muted" />
							<div className="h-4 w-64 rounded bg-muted" />
							<div className="h-4 w-48 rounded bg-muted" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Show error state
	if ((isSuccess && !sequenceData) || error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center">
					<Layers className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
					<h2 className="mb-2 font-semibold text-lg">Sequence not found</h2>
					<p className="mb-4 text-muted-foreground">
						The sequence you're looking for doesn't exist or couldn't be loaded.
					</p>
					<Button onClick={() => router.push("/admin/automation/sequences")}>
						Back to Sequences
					</Button>
				</div>
			</div>
		);
	}

	if (!sequence) {
		return null;
	}

	const initials = "SQ";
	const messageCount = sequence.template_follow_up_messages?.length || 0;

	return (
		<div className="min-h-screen bg-background">
			{/* Enhanced Header with Breadcrumb */}
			<div className="border-b bg-background">
				<div className="px-10 py-4">
					<div className="mb-2 flex items-center gap-2">
						<BackButton />
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<Link
								href="/admin/automation/sequences"
								className="transition-colors hover:text-foreground"
							>
								Sequences
							</Link>
							<ChevronRight className="h-3 w-3" />
							<span>{sequence.display_name}</span>
						</div>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
								<span className="font-semibold text-primary text-sm">
									{initials}
								</span>
							</div>
							<div>
								<h1 className="font-semibold text-xl">
									{sequence.display_name}
								</h1>
								{sequence._count?.automated_follow_ups > 0 && (
									<div className="mt-0.5 flex items-center gap-2">
										<Badge variant="success" className="h-4 px-1.5 text-[10px]">
											{sequence._count.automated_follow_ups} Active Follow-ups
										</Badge>
									</div>
								)}
							</div>
						</div>

						<div className="flex items-center gap-2">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="sm">
										<MoreVertical className="h-3.5 w-3.5" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuSeparator />
									<DropdownMenuItem
										className="text-destructive focus:text-destructive"
										onClick={() => setShowDeleteConfirm(true)}
									>
										<Trash2 className="mr-2 h-3.5 w-3.5" />
										Delete Sequence
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>
			</div>

			<div className="space-y-6 px-10 py-6">
				{/* Sequence Information with inline editing */}
				<EditableSection
					title="Sequence Information"
					onEditStart={() => {
						setEditedSequence(sequence);
					}}
					onSave={saveAllChanges}
					onCancel={() => {
						setEditedSequence(sequence);
					}}
				>
					{(editing) => (
						<div className="grid gap-8 lg:grid-cols-2">
							{/* Basic Details */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Basic Details
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Name:</p>
											<InlineEditField
												value={editedSequence?.display_name || ""}
												onSave={(value) =>
													updateEditedField("display_name", value)
												}
												editing={editing}
												type="text"
												placeholder="Enter sequence name"
												required
											/>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Subject:</p>
											<InlineEditField
												value={editedSequence?.subject || ""}
												onSave={(value) => updateEditedField("subject", value)}
												editing={editing}
												type="text"
												placeholder="Enter email subject"
												required
											/>
										</div>
									</div>
								</div>
							</div>

							{/* Statistics */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Usage Statistics
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<Bot className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Active Follow-ups:
											</p>
											<Badge variant="success" className="h-5 text-xs">
												{sequence._count?.automated_follow_ups || 0}
											</Badge>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<MessageSquare className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Total Messages:
											</p>
											<p className="font-medium text-sm">
												{messageCount} messages
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</EditableSection>

				{/* Messages Section */}
				<SequenceMessagesSection
					sequenceId={sequenceId}
					messages={sequence.template_follow_up_messages || []}
					onEditMessage={handleEditMessage}
					onAddMessage={navigateToAddMessage}
				/>

				{/* System Information */}
				<div className="mt-8 border-t pt-6">
					<div className="mx-auto max-w-3xl">
						<div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground/70 text-xs">
							<div className="flex items-center gap-2">
								<Clock className="h-3 w-3" />
								<span>Created at:</span>
								<span>
									{format(
										new Date(sequence.created_at),
										"MMM d, yyyy 'at' h:mm a",
									)}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="h-3 w-3" />
								<span>Updated at:</span>
								<span>
									{format(
										new Date(sequence.updated_at),
										"MMM d, yyyy 'at' h:mm a",
									)}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<SequenceMessageModal
				open={messageModalOpen}
				onClose={() => {
					setMessageModalOpen(false);
					setMessageToEdit(null);
				}}
				sequenceId={sequenceId}
				messageToEdit={messageToEdit}
			/>

			<AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Sequence</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this sequence? This action cannot
							be undone. All associated messages and active follow-ups will be
							removed.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteSequence}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
