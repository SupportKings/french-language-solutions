"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@uidotdev/usehooks";
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
	MoreHorizontal, 
	Search, 
	Plus, 
	Eye, 
	Edit, 
	Trash,
	MessageSquare,
	Clock,
	Users,
	Mail,
	Timer
} from "lucide-react";
import { useSequences, useDeleteSequence } from "../queries/sequences.queries";
import type { SequenceQuery } from "../schemas/sequence.schema";
import { format } from "date-fns";
import Link from "next/link";

export function SequencesTable() {
	const router = useRouter();
	const [searchInput, setSearchInput] = useState("");
	const debouncedSearch = useDebounce(searchInput, 300);
	const [query, setQuery] = useState<SequenceQuery>({
		search: "",
		page: 1,
		limit: 10,
	});

	const deleteSequence = useDeleteSequence();

	// Update query when search changes
	const finalQuery = useMemo(() => ({
		...query,
		search: debouncedSearch,
	}), [query, debouncedSearch]);

	const { data, isLoading, error } = useSequences(finalQuery);

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this sequence? This will also delete all associated messages.")) {
			await deleteSequence.mutateAsync(id);
		}
	};

	const formatDelay = (minutes: number) => {
		if (minutes < 60) {
			return `${minutes} min`;
		} else if (minutes < 1440) {
			const hours = Math.floor(minutes / 60);
			return `${hours} hr${hours > 1 ? 's' : ''}`;
		} else {
			const days = Math.floor(minutes / 1440);
			return `${days} day${days > 1 ? 's' : ''}`;
		}
	};

	if (error) {
		return (
			<Card>
				<CardContent className="py-10">
					<p className="text-center text-muted-foreground">
						Failed to load sequences
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{/* Compact toolbar with search and action button */}
			<div className="flex items-center gap-3">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search sequences..."
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						className="h-9 pl-9 bg-muted/50"
					/>
				</div>
				
				<div className="ml-auto">
					<Link href="/admin/automation/sequences/new">
						<Button size="sm" className="h-9">
							<Plus className="mr-1.5 h-4 w-4" />
							New Sequence
						</Button>
					</Link>
				</div>
			</div>

				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Sequence Name</TableHead>
								<TableHead>Subject</TableHead>
								<TableHead>Messages</TableHead>
								<TableHead>First Delay</TableHead>
								<TableHead>Active Follow-ups</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className="w-[70px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								Array.from({ length: 5 }).map((_, i) => (
									<TableRow key={i}>
										<TableCell><Skeleton className="h-5 w-32" /></TableCell>
										<TableCell><Skeleton className="h-5 w-40" /></TableCell>
										<TableCell><Skeleton className="h-5 w-20" /></TableCell>
										<TableCell><Skeleton className="h-5 w-24" /></TableCell>
										<TableCell><Skeleton className="h-5 w-24" /></TableCell>
										<TableCell><Skeleton className="h-5 w-24" /></TableCell>
										<TableCell><Skeleton className="h-5 w-8" /></TableCell>
									</TableRow>
								))
							) : data?.data?.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} className="text-center text-muted-foreground">
										No sequences found
									</TableCell>
								</TableRow>
							) : (
								data?.data?.map((sequence: any) => (
									<TableRow key={sequence.id}>
										<TableCell>
											<div className="flex items-center gap-2">
												<MessageSquare className="h-4 w-4 text-muted-foreground" />
												<div>
													<p className="font-medium">{sequence.display_name}</p>
													<p className="text-xs text-muted-foreground">
														ID: {sequence.id.slice(0, 8)}
													</p>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Mail className="h-4 w-4 text-muted-foreground" />
												<p className="text-sm">{sequence.subject}</p>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="outline" className="gap-1">
												<MessageSquare className="h-3 w-3" />
												{sequence.template_follow_up_messages?.length || 0} messages
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1">
												<Timer className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm">
													{formatDelay(sequence.first_follow_up_delay_minutes)}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1">
												<Users className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm">
													{sequence._count?.automated_follow_ups || 0} active
												</span>
											</div>
										</TableCell>
										<TableCell>
											<p className="text-sm">
												{format(new Date(sequence.created_at), "MMM d, yyyy")}
											</p>
										</TableCell>
										<TableCell>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<Link href={`/admin/automation/sequences/${sequence.id}`}>
														<DropdownMenuItem>
															<Eye className="mr-2 h-4 w-4" />
															View Details
														</DropdownMenuItem>
													</Link>
													<Link href={`/admin/automation/sequences/${sequence.id}/edit`}>
														<DropdownMenuItem>
															<Edit className="mr-2 h-4 w-4" />
															Edit
														</DropdownMenuItem>
													</Link>
													<DropdownMenuItem 
														onClick={() => handleDelete(sequence.id)}
														className="text-destructive"
													>
														<Trash className="mr-2 h-4 w-4" />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
				</Table>
			</div>

				{data && data.meta?.totalPages > 1 && (
					<div className="mt-4 flex items-center justify-between">
						<p className="text-sm text-muted-foreground">
							Page {data.meta.page} of {data.meta.totalPages}
						</p>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setQuery({ ...query, page: query.page - 1 })}
								disabled={query.page === 1}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setQuery({ ...query, page: query.page + 1 })}
								disabled={query.page === data.meta.totalPages}
							>
								Next
							</Button>
						</div>
					</div>
				)}
		</div>
	);
}