"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { format } from "date-fns";
import {
	Edit2,
	MoreHorizontal,
	Plus,
	Save,
	Search,
	Trash,
	X,
} from "lucide-react";
import { toast } from "sonner";
import {
	languageLevelQueries,
	useCreateLanguageLevel,
	useDeleteLanguageLevel,
	useUpdateLanguageLevel,
} from "../queries/language-levels.queries";
import type { LanguageLevel } from "../types/language-level.types";

const LEVEL_GROUPS = [
	{ value: "a0", label: "A0" },
	{ value: "a1", label: "A1" },
	{ value: "a2", label: "A2" },
	{ value: "b1", label: "B1" },
	{ value: "b2", label: "B2" },
	{ value: "c1", label: "C1" },
	{ value: "c2", label: "C2" },
];

export function LanguageLevelsTable() {
	const [searchInput, setSearchInput] = useState("");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [editForm, setEditForm] = useState<Partial<LanguageLevel>>({});
	const [newForm, setNewForm] = useState<Partial<LanguageLevel>>({
		code: "",
		display_name: "",
		level_group: "",
	});
	const [levelToDelete, setLevelToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const debouncedSearch = useDebounce(searchInput, 300);

	const {
		data: levels,
		isLoading,
		error,
	} = useQuery(languageLevelQueries.list());
	const updateMutation = useUpdateLanguageLevel();
	const createMutation = useCreateLanguageLevel();
	const deleteMutation = useDeleteLanguageLevel();

	const filteredLevels = levels?.filter((level) => {
		if (!debouncedSearch) return true;
		const searchLower = debouncedSearch.toLowerCase();
		return (
			level.code.toLowerCase().includes(searchLower) ||
			level.display_name.toLowerCase().includes(searchLower) ||
			level.level_group.toLowerCase().includes(searchLower)
		);
	});

	const handleEdit = (level: LanguageLevel) => {
		setEditingId(level.id);
		setEditForm({
			code: level.code,
			display_name: level.display_name,
			level_group: level.level_group,
		});
	};

	const handleSave = async () => {
		if (!editingId) return;

		try {
			await updateMutation.mutateAsync({ id: editingId, data: editForm });
			toast.success("Language level updated successfully");
			setEditingId(null);
			setEditForm({});
		} catch (error) {
			toast.error("Failed to update language level");
		}
	};

	const handleCancel = () => {
		setEditingId(null);
		setEditForm({});
	};

	const handleCreate = async () => {
		if (!newForm.code || !newForm.display_name || !newForm.level_group) {
			toast.error("Please fill in all required fields");
			return;
		}

		try {
			await createMutation.mutateAsync(newForm);
			toast.success("Language level created successfully");
			setIsCreating(false);
			setNewForm({
				code: "",
				display_name: "",
				level_group: "",
			});
		} catch (error) {
			toast.error("Failed to create language level");
		}
	};

	const handleDelete = async () => {
		if (isDeleting || !levelToDelete) return;

		setIsDeleting(true);
		try {
			await deleteMutation.mutateAsync(levelToDelete);
			toast.success("Language level deleted successfully");
			setLevelToDelete(null);
		} catch (error: any) {
			const message =
				error?.response?.data?.message ||
				error?.message ||
				"Failed to delete language level";
			toast.error(message);
		} finally {
			setIsDeleting(false);
		}
	};

	if (error) {
		return (
			<Card>
				<CardContent className="py-10">
					<p className="text-center text-muted-foreground">
						Failed to load language levels
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div className="rounded-md border">
				<div className="space-y-2 border-b bg-muted/30 px-4 py-2">
					<div className="flex items-center gap-3">
						<div className="relative max-w-sm flex-1">
							<Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search language levels..."
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								className="h-9 bg-muted/50 pl-9"
							/>
						</div>

						<div className="ml-auto">
							<Button
								size="sm"
								className="h-9"
								onClick={() => setIsCreating(true)}
								disabled={isCreating}
							>
								<Plus className="mr-1.5 h-4 w-4" />
								Add Level
							</Button>
						</div>
					</div>
				</div>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[120px]">Code</TableHead>
							<TableHead>Display Name</TableHead>
							<TableHead className="w-[120px]">Level Group</TableHead>
							<TableHead>Created Date</TableHead>
							<TableHead>Last Updated</TableHead>
							<TableHead className="w-[100px]" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{isCreating && (
							<TableRow>
								<TableCell>
									<Input
										value={newForm.code || ""}
										onChange={(e) =>
											setNewForm({ ...newForm, code: e.target.value })
										}
										placeholder="e.g., a1.1"
										className="h-8"
									/>
								</TableCell>
								<TableCell>
									<Input
										value={newForm.display_name || ""}
										onChange={(e) =>
											setNewForm({ ...newForm, display_name: e.target.value })
										}
										placeholder="e.g., A1.1 - Elementary"
										className="h-8"
									/>
								</TableCell>
								<TableCell>
									<Select
										value={newForm.level_group || ""}
										onValueChange={(value) =>
											setNewForm({ ...newForm, level_group: value })
										}
									>
										<SelectTrigger className="h-8">
											<SelectValue placeholder="Select group" />
										</SelectTrigger>
										<SelectContent>
											{LEVEL_GROUPS.map((group) => (
												<SelectItem key={group.value} value={group.value}>
													{group.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</TableCell>
								<TableCell>-</TableCell>
								<TableCell>-</TableCell>
								<TableCell>
									<div className="flex gap-1">
										<Button
											size="icon"
											variant="ghost"
											className="h-8 w-8"
											onClick={handleCreate}
										>
											<Save className="h-4 w-4" />
										</Button>
										<Button
											size="icon"
											variant="ghost"
											className="h-8 w-8"
											onClick={() => {
												setIsCreating(false);
												setNewForm({
													code: "",
													display_name: "",
													level_group: "",
												});
											}}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						)}

						{isLoading ? (
							Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell>
										<Skeleton className="h-5 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-40" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-16" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-8" />
									</TableCell>
								</TableRow>
							))
						) : filteredLevels?.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={6}
									className="text-center text-muted-foreground"
								>
									No language levels found
								</TableCell>
							</TableRow>
						) : (
							filteredLevels?.map((level) => (
								<TableRow
									key={level.id}
									className="transition-colors duration-150 hover:bg-muted/50"
								>
									{editingId === level.id ? (
										<>
											<TableCell>
												<Input
													value={editForm.code || ""}
													onChange={(e) =>
														setEditForm({ ...editForm, code: e.target.value })
													}
													className="h-8"
												/>
											</TableCell>
											<TableCell>
												<Input
													value={editForm.display_name || ""}
													onChange={(e) =>
														setEditForm({
															...editForm,
															display_name: e.target.value,
														})
													}
													className="h-8"
												/>
											</TableCell>
											<TableCell>
												<Select
													value={editForm.level_group || ""}
													onValueChange={(value) =>
														setEditForm({ ...editForm, level_group: value })
													}
												>
													<SelectTrigger className="h-8">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{LEVEL_GROUPS.map((group) => (
															<SelectItem key={group.value} value={group.value}>
																{group.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</TableCell>
											<TableCell>
												<p className="text-sm">
													{format(new Date(level.created_at), "MMM d, yyyy")}
												</p>
											</TableCell>
											<TableCell>
												<p className="text-sm">
													{format(new Date(level.updated_at), "MMM d, yyyy")}
												</p>
											</TableCell>
											<TableCell>
												<div className="flex gap-1">
													<Button
														size="icon"
														variant="ghost"
														className="h-8 w-8"
														onClick={handleSave}
													>
														<Save className="h-4 w-4" />
													</Button>
													<Button
														size="icon"
														variant="ghost"
														className="h-8 w-8"
														onClick={handleCancel}
													>
														<X className="h-4 w-4" />
													</Button>
												</div>
											</TableCell>
										</>
									) : (
										<>
											<TableCell>
												<Badge variant="outline">
													{level.code.toUpperCase()}
												</Badge>
											</TableCell>
											<TableCell>
												<p className="font-medium">{level.display_name}</p>
											</TableCell>
											<TableCell>
												<Badge variant="secondary">
													{level.level_group.toUpperCase()}
												</Badge>
											</TableCell>
											<TableCell>
												<p className="text-sm">
													{format(new Date(level.created_at), "MMM d, yyyy")}
												</p>
											</TableCell>
											<TableCell>
												<p className="text-sm">
													{format(new Date(level.updated_at), "MMM d, yyyy")}
												</p>
											</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8"
														>
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem onClick={() => handleEdit(level)}>
															<Edit2 className="mr-2 h-4 w-4" />
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={(e) => {
																e.stopPropagation();
																setLevelToDelete(level.id);
															}}
															className="text-destructive"
														>
															<Trash className="mr-2 h-4 w-4" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</>
									)}
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<DeleteConfirmationDialog
				open={!!levelToDelete}
				onOpenChange={(open) => !open && setLevelToDelete(null)}
				onConfirm={handleDelete}
				title="Delete Language Level"
				description="Are you sure you want to delete this language level? Any students, cohorts, or assessments using this level will have their language level set to empty."
				isDeleting={isDeleting}
			/>
		</div>
	);
}
