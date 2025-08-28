"use client";

import { useState } from "react";

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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface Category {
	id: string;
	name: string;
	description?: string | null;
	is_active?: boolean | null;
}

interface CategoryManagementDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	categories: Category[];
	isLoading?: boolean;
	onCreateCategory: (data: {
		name: string;
		description?: string;
	}) => Promise<void>;
	onUpdateCategory: (
		id: string,
		data: { name: string; description?: string; is_active: boolean },
	) => Promise<void>;
	onDeleteCategory: (id: string) => Promise<void>;
}

export default function CategoryManagementDialog({
	open,
	onOpenChange,
	title,
	description,
	categories,
	isLoading,
	onCreateCategory,
	onUpdateCategory,
	onDeleteCategory,
}: CategoryManagementDialogProps) {
	const [isCreating, setIsCreating] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Form states
	const [newName, setNewName] = useState("");
	const [newDescription, setNewDescription] = useState("");
	const [editName, setEditName] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [editIsActive, setEditIsActive] = useState(true);

	const handleCreate = async () => {
		if (!newName.trim()) {
			toast.error("Category name is required");
			return;
		}

		setIsSubmitting(true);
		try {
			await onCreateCategory({
				name: newName.trim(),
				description: newDescription.trim() || undefined,
			});
			setNewName("");
			setNewDescription("");
			setIsCreating(false);
			toast.success("Category created successfully");
		} catch (error) {
			toast.error("Failed to create category");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdate = async (id: string) => {
		if (!editName.trim()) {
			toast.error("Category name is required");
			return;
		}

		setIsSubmitting(true);
		try {
			await onUpdateCategory(id, {
				name: editName.trim(),
				description: editDescription.trim() || undefined,
				is_active: editIsActive,
			});
			setEditingId(null);
			toast.success("Category updated successfully");
		} catch (error) {
			toast.error("Failed to update category");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (!deleteId) return;

		setIsSubmitting(true);
		try {
			await onDeleteCategory(deleteId);
			setDeleteId(null);
			toast.success("Category deleted successfully");
		} catch (error) {
			toast.error("Failed to delete category");
		} finally {
			setIsSubmitting(false);
		}
	};

	const startEdit = (category: Category) => {
		setEditingId(category.id);
		setEditName(category.name);
		setEditDescription(category.description || "");
		setEditIsActive(category.is_active ?? true);
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditName("");
		setEditDescription("");
		setEditIsActive(true);
	};

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="flex max-h-[90vh] max-w-2xl flex-col">
					<div className="flex-shrink-0">
						<DialogTitle>{title}</DialogTitle>
						<DialogDescription>{description}</DialogDescription>
					</div>

					<div className="flex flex-1 flex-col space-y-6 overflow-hidden">
						{/* Add new category section with gap */}
						{!isCreating ? (
							<Button
								onClick={() => setIsCreating(true)}
								variant="outline"
								className="w-full"
							>
								<Plus className="mr-2 h-4 w-4" />
								Add New Category
							</Button>
						) : (
							<div className="space-y-3 rounded-lg border p-4">
								<div className="space-y-2">
									<Label>Category Name</Label>
									<Input
										value={newName}
										onChange={(e) => setNewName(e.target.value)}
										placeholder="Enter category name"
										disabled={isSubmitting}
									/>
								</div>
								<div className="space-y-2">
									<Label>Description (Optional)</Label>
									<Textarea
										value={newDescription}
										onChange={(e) => setNewDescription(e.target.value)}
										placeholder="Enter category description"
										rows={2}
										disabled={isSubmitting}
									/>
								</div>
								<div className="flex justify-end gap-2">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => {
											setIsCreating(false);
											setNewName("");
											setNewDescription("");
										}}
										disabled={isSubmitting}
									>
										Cancel
									</Button>
									<Button
										size="sm"
										onClick={handleCreate}
										disabled={isSubmitting || !newName.trim()}
									>
										{isSubmitting && (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										)}
										Create
									</Button>
								</div>
							</div>
						)}

						{/* Categories list */}
						<ScrollArea className="flex-1 rounded-lg border">
							<div className="p-4">
								{isLoading ? (
									<div className="flex items-center justify-center py-8">
										<Loader2 className="h-6 w-6 animate-spin" />
									</div>
								) : categories.length === 0 ? (
									<div className="py-8 text-center text-muted-foreground text-sm">
										No categories found. Create one to get started.
									</div>
								) : (
									<div className="space-y-2">
										{categories.map((category) => (
											<div key={category.id} className="rounded-lg border p-3">
												{editingId === category.id ? (
													<div className="space-y-3">
														<div className="space-y-2">
															<Label>Category Name</Label>
															<Input
																value={editName}
																onChange={(e) => setEditName(e.target.value)}
																disabled={isSubmitting}
															/>
														</div>
														<div className="space-y-2">
															<Label>Description</Label>
															<Textarea
																value={editDescription}
																onChange={(e) =>
																	setEditDescription(e.target.value)
																}
																rows={2}
																disabled={isSubmitting}
															/>
														</div>
														<div className="flex items-center justify-between">
															<div className="flex items-center space-x-2">
																<Switch
																	id={`active-${category.id}`}
																	checked={editIsActive}
																	onCheckedChange={setEditIsActive}
																	disabled={isSubmitting}
																/>
																<Label htmlFor={`active-${category.id}`}>
																	Active
																</Label>
															</div>
															<div className="flex gap-2">
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={cancelEdit}
																	disabled={isSubmitting}
																>
																	<X className="h-4 w-4" />
																</Button>
																<Button
																	size="sm"
																	onClick={() => handleUpdate(category.id)}
																	disabled={isSubmitting || !editName.trim()}
																>
																	{isSubmitting ? (
																		<Loader2 className="h-4 w-4 animate-spin" />
																	) : (
																		<Check className="h-4 w-4" />
																	)}
																</Button>
															</div>
														</div>
													</div>
												) : (
													<div className="flex items-start justify-between">
														<div className="space-y-1">
															<div className="flex items-center gap-2">
																<h4 className="font-medium">{category.name}</h4>
																{category.is_active === false && (
																	<Badge variant="secondary">Inactive</Badge>
																)}
															</div>
															{category.description && (
																<p className="text-muted-foreground text-sm">
																	{category.description}
																</p>
															)}
														</div>
														<div className="flex gap-1">
															<Button
																variant="ghost"
																size="sm"
																onClick={() => startEdit(category)}
																disabled={isSubmitting}
															>
																<Pencil className="h-4 w-4" />
															</Button>
															<Button
																variant="ghost"
																size="sm"
																onClick={() => setDeleteId(category.id)}
																disabled={isSubmitting}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													</div>
												)}
											</div>
										))}
									</div>
								)}
							</div>
						</ScrollArea>
					</div>
				</DialogContent>
			</Dialog>

			{/* Delete confirmation dialog */}
			<AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Category</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this category? This action cannot
							be undone. Items using this category will have their category
							cleared.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isSubmitting}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isSubmitting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isSubmitting && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
