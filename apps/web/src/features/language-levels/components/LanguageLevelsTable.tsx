"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Plus, Trash, Save, X, Edit2, Search } from "lucide-react";
import { languageLevelQueries, useUpdateLanguageLevel, useCreateLanguageLevel, useDeleteLanguageLevel } from "../queries/language-levels.queries";
import type { LanguageLevel } from "../types/language-level.types";
import { format } from "date-fns";
import { useDebounce } from "@uidotdev/usehooks";
import { toast } from "sonner";

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

	const debouncedSearch = useDebounce(searchInput, 300);

	const { data: levels, isLoading, error } = useQuery(languageLevelQueries.list());
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
			level_group: level.level_group
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

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this language level?")) {
			return;
		}

		try {
			await deleteMutation.mutateAsync(id);
			toast.success("Language level deleted successfully");
		} catch (error) {
			toast.error("Failed to delete language level");
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
				<div className="border-b bg-muted/30 px-4 py-2 space-y-2">
					<div className="flex items-center gap-3">
						<div className="relative flex-1 max-w-sm">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
							<Input
								placeholder="Search language levels..."
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								className="h-9 pl-9 bg-muted/50"
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
							<TableHead className="w-[100px]"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isCreating && (
							<TableRow>
								<TableCell>
									<Input
										value={newForm.code || ""}
										onChange={(e) => setNewForm({ ...newForm, code: e.target.value })}
										placeholder="e.g., a1.1"
										className="h-8"
									/>
								</TableCell>
								<TableCell>
									<Input
										value={newForm.display_name || ""}
										onChange={(e) => setNewForm({ ...newForm, display_name: e.target.value })}
										placeholder="e.g., A1.1 - Elementary"
										className="h-8"
									/>
								</TableCell>
								<TableCell>
									<Select
										value={newForm.level_group || ""}
										onValueChange={(value) => setNewForm({ ...newForm, level_group: value })}
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
									<TableCell><Skeleton className="h-5 w-20" /></TableCell>
									<TableCell><Skeleton className="h-5 w-40" /></TableCell>
									<TableCell><Skeleton className="h-5 w-16" /></TableCell>
									<TableCell><Skeleton className="h-5 w-24" /></TableCell>
									<TableCell><Skeleton className="h-5 w-24" /></TableCell>
									<TableCell><Skeleton className="h-5 w-8" /></TableCell>
								</TableRow>
							))
						) : filteredLevels?.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="text-center text-muted-foreground">
									No language levels found
								</TableCell>
							</TableRow>
						) : (
							filteredLevels?.map((level) => (
								<TableRow key={level.id} className="hover:bg-muted/50 transition-colors duration-150">
									{editingId === level.id ? (
										<>
											<TableCell>
												<Input
													value={editForm.code || ""}
													onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
													className="h-8"
												/>
											</TableCell>
											<TableCell>
												<Input
													value={editForm.display_name || ""}
													onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
													className="h-8"
												/>
											</TableCell>
											<TableCell>
												<Select
													value={editForm.level_group || ""}
													onValueChange={(value) => setEditForm({ ...editForm, level_group: value })}
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
														<Button variant="ghost" size="icon" className="h-8 w-8">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem onClick={() => handleEdit(level)}>
															<Edit2 className="mr-2 h-4 w-4" />
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem 
															onClick={() => handleDelete(level.id)}
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
		</div>
	);
}