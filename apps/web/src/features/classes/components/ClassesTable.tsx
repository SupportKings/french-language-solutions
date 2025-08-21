"use client";

import { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreHorizontal, Edit, Trash, Eye, Calendar, Users, Video, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useDeleteClass } from "../queries/classes.queries";
import type { Class } from "../schemas/class.schema";

interface ClassesTableProps {
	classes: Class[];
	isLoading?: boolean;
}

export function ClassesTable({ classes, isLoading }: ClassesTableProps) {
	const router = useRouter();
	const deleteClass = useDeleteClass();
	const [deleteId, setDeleteId] = useState<string | null>(null);

	const handleDelete = () => {
		if (deleteId) {
			deleteClass.mutate(deleteId, {
				onSuccess: () => {
					setDeleteId(null);
				},
			});
		}
	};

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "scheduled":
				return "default";
			case "in_progress":
				return "secondary";
			case "completed":
				return "success";
			case "cancelled":
				return "destructive";
			default:
				return "outline";
		}
	};

	const getModeBadgeVariant = (mode: string) => {
		switch (mode) {
			case "online":
				return "outline";
			case "in_person":
				return "secondary";
			case "hybrid":
				return "default";
			default:
				return "outline";
		}
	};

	const formatDateTime = (dateTime: string) => {
		try {
			return format(new Date(dateTime), "MMM d, yyyy h:mm a");
		} catch {
			return dateTime;
		}
	};

	if (isLoading) {
		return (
			<div className="rounded-xl border bg-card/95 backdrop-blur-sm">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Mode</TableHead>
							<TableHead>Time</TableHead>
							<TableHead>Students</TableHead>
							<TableHead className="w-[50px]"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{[...Array(5)].map((_, i) => (
							<TableRow key={i}>
								<TableCell>
									<div className="h-4 w-32 bg-muted animate-pulse rounded" />
								</TableCell>
								<TableCell>
									<div className="h-5 w-20 bg-muted animate-pulse rounded" />
								</TableCell>
								<TableCell>
									<div className="h-5 w-16 bg-muted animate-pulse rounded" />
								</TableCell>
								<TableCell>
									<div className="h-4 w-28 bg-muted animate-pulse rounded" />
								</TableCell>
								<TableCell>
									<div className="h-4 w-12 bg-muted animate-pulse rounded" />
								</TableCell>
								<TableCell>
									<div className="h-8 w-8 bg-muted animate-pulse rounded" />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		);
	}

	if (!classes.length) {
		return (
			<div className="rounded-xl border bg-card/95 backdrop-blur-sm p-12">
				<div className="text-center">
					<Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
					<h3 className="mt-4 text-lg font-semibold">No classes found</h3>
					<p className="mt-2 text-sm text-muted-foreground">
						Get started by creating your first class.
					</p>
					<Button
						onClick={() => router.push("/admin/classes/new")}
						className="mt-4"
					>
						Create Class
					</Button>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="rounded-xl border bg-card/95 backdrop-blur-sm overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow className="hover:bg-transparent">
							<TableHead>Name</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Mode</TableHead>
							<TableHead>Schedule</TableHead>
							<TableHead>Students</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{classes.map((classItem) => (
							<TableRow
								key={classItem.id}
								className="cursor-pointer hover:bg-muted/50"
								onClick={() => router.push(`/admin/classes/${classItem.id}`)}
							>
								<TableCell className="font-medium">
									<div>
										<div className="font-semibold">{classItem.name}</div>
										{classItem.description && (
											<div className="text-xs text-muted-foreground line-clamp-1">
												{classItem.description}
											</div>
										)}
									</div>
								</TableCell>
								<TableCell>
									<Badge variant={getStatusBadgeVariant(classItem.status)}>
										{classItem.status.replace("_", " ")}
									</Badge>
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										{classItem.mode === "online" && <Video className="h-3 w-3" />}
										{classItem.mode === "in_person" && <MapPin className="h-3 w-3" />}
										<Badge variant={getModeBadgeVariant(classItem.mode)} className="text-xs">
											{classItem.mode.replace("_", " ")}
										</Badge>
									</div>
								</TableCell>
								<TableCell>
									<div className="text-sm">
										<div>{formatDateTime(classItem.start_time)}</div>
										<div className="text-xs text-muted-foreground">
											to {formatDateTime(classItem.end_time)}
										</div>
									</div>
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										<Users className="h-3 w-3 text-muted-foreground" />
										<span className="text-sm">
											{classItem.current_enrollment}/{classItem.max_students}
										</span>
									</div>
								</TableCell>
								<TableCell className="text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
											<Button variant="ghost" size="icon" className="h-8 w-8">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												onClick={(e) => {
													e.stopPropagation();
													router.push(`/admin/classes/${classItem.id}`);
												}}
											>
												<Eye className="mr-2 h-4 w-4" />
												View
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={(e) => {
													e.stopPropagation();
													router.push(`/admin/classes/${classItem.id}/edit`);
												}}
											>
												<Edit className="mr-2 h-4 w-4" />
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem
												className="text-destructive"
												onClick={(e) => {
													e.stopPropagation();
													setDeleteId(classItem.id);
												}}
											>
												<Trash className="mr-2 h-4 w-4" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete this class. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}