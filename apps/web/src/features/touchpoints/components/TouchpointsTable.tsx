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
	Phone,
	Mail,
	MessageSquare,
	User,
	ArrowUpRight,
	ArrowDownLeft,
	Bot,
	Smartphone,
	Globe,
	Webhook
} from "lucide-react";
import { useTouchpoints, useDeleteTouchpoint } from "../queries/touchpoints.queries";
import type { TouchpointQuery } from "../schemas/touchpoint.schema";
import { format } from "date-fns";
import Link from "next/link";
import { DataTableFilter, useDataTableFilters } from "@/components/data-table-filter";

const channelIcons = {
	sms: MessageSquare,
	call: Phone,
	whatsapp: MessageSquare,
	email: Mail,
};

const channelLabels = {
	sms: "SMS",
	call: "Call",
	whatsapp: "WhatsApp",
	email: "Email",
};

const typeIcons = {
	inbound: ArrowDownLeft,
	outbound: ArrowUpRight,
};

const typeLabels = {
	inbound: "Inbound",
	outbound: "Outbound",
};

const sourceIcons = {
	manual: User,
	automated: Bot,
	openphone: Phone,
	gmail: Mail,
	whatsapp_business: MessageSquare,
	webhook: Webhook,
};

const sourceLabels = {
	manual: "Manual",
	automated: "Automated",
	openphone: "OpenPhone",
	gmail: "Gmail",
	whatsapp_business: "WhatsApp Business",
	webhook: "Webhook",
};

// Define column configurations for data-table-filter
const touchpointColumns = [
	{
		id: "channel",
		accessor: (touchpoint: any) => touchpoint.channel,
		displayName: "Channel",
		icon: MessageSquare,
		type: "option" as const,
		options: Object.entries(channelLabels).map(([value, label]) => ({
			label,
			value,
		})),
	},
	{
		id: "type",
		accessor: (touchpoint: any) => touchpoint.type,
		displayName: "Direction",
		icon: ArrowUpRight,
		type: "option" as const,
		options: Object.entries(typeLabels).map(([value, label]) => ({
			label,
			value,
		})),
	},
	{
		id: "source",
		accessor: (touchpoint: any) => touchpoint.source,
		displayName: "Source",
		icon: Globe,
		type: "option" as const,
		options: Object.entries(sourceLabels).map(([value, label]) => ({
			label,
			value,
		})),
	},
] as const;

export function TouchpointsTable() {
	const router = useRouter();
	const [searchInput, setSearchInput] = useState("");
	const debouncedSearch = useDebounce(searchInput, 300);
	const [query, setQuery] = useState<TouchpointQuery>({
		search: "",
		page: 1,
		limit: 10,
	});

	const deleteTouchpoint = useDeleteTouchpoint();

	// Data table filters hook
	const {
		columns,
		filters,
		actions,
		strategy,
	} = useDataTableFilters({
		strategy: "server" as const,
		data: [], // Empty for server-side filtering
		columnsConfig: touchpointColumns,
	});

	// Convert filters to query params
	const filterQuery = useMemo(() => {
		const channelFilter = filters.find(f => f.columnId === "channel");
		const typeFilter = filters.find(f => f.columnId === "type");
		const sourceFilter = filters.find(f => f.columnId === "source");
		
		return {
			channel: channelFilter?.values?.length ? channelFilter.values as any : undefined,
			type: typeFilter?.values?.length ? typeFilter.values as any : undefined,
			source: sourceFilter?.values?.length ? sourceFilter.values as any : undefined,
		};
	}, [filters]);

	// Update query when search or filters change
	const finalQuery = useMemo(() => ({
		...query,
		search: debouncedSearch,
		...filterQuery,
	}), [query, debouncedSearch, filterQuery]);

	const { data, isLoading, error } = useTouchpoints(finalQuery);

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this touchpoint?")) {
			await deleteTouchpoint.mutateAsync(id);
		}
	};

	const getChannelColor = (channel: string) => {
		switch (channel) {
			case "sms": return "info";
			case "call": return "warning";
			case "whatsapp": return "success";
			case "email": return "default";
			default: return "outline";
		}
	};

	const getTypeColor = (type: string) => {
		return type === "inbound" ? "success" : "secondary";
	};

	if (error) {
		return (
			<Card>
				<CardContent className="py-10">
					<p className="text-center text-muted-foreground">
						Failed to load touchpoints
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
						placeholder="Search by student or message..."
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						className="h-9 pl-9 bg-muted/50"
					/>
				</div>
				
				<div className="ml-auto">
					<Link href="/admin/automation/touchpoints/new">
						<Button size="sm" className="h-9">
							<Plus className="mr-1.5 h-4 w-4" />
							Log Touchpoint
						</Button>
					</Link>
				</div>
			</div>

			<div className="rounded-md border">
				{/* Filter bar */}
				<div className="p-4 bg-muted/30 border-b border-border/50">
					<DataTableFilter
						columns={columns}
						filters={filters}
						actions={actions}
						strategy={strategy}
					/>
				</div>
				
				<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Student</TableHead>
								<TableHead>Date & Time</TableHead>
								<TableHead>Channel</TableHead>
								<TableHead>Direction</TableHead>
								<TableHead>Message</TableHead>
								<TableHead>Source</TableHead>
								<TableHead>Follow-up</TableHead>
								<TableHead className="w-[70px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								Array.from({ length: 5 }).map((_, i) => (
									<TableRow key={i}>
										<TableCell><Skeleton className="h-5 w-32" /></TableCell>
										<TableCell><Skeleton className="h-5 w-24" /></TableCell>
										<TableCell><Skeleton className="h-5 w-20" /></TableCell>
										<TableCell><Skeleton className="h-5 w-20" /></TableCell>
										<TableCell><Skeleton className="h-5 w-40" /></TableCell>
										<TableCell><Skeleton className="h-5 w-24" /></TableCell>
										<TableCell><Skeleton className="h-5 w-24" /></TableCell>
										<TableCell><Skeleton className="h-5 w-8" /></TableCell>
									</TableRow>
								))
							) : data?.data?.length === 0 ? (
								<TableRow>
									<TableCell colSpan={8} className="text-center text-muted-foreground">
										No touchpoints found
									</TableCell>
								</TableRow>
							) : (
								data?.data?.map((touchpoint: any) => {
									const ChannelIcon = channelIcons[touchpoint.channel];
									const TypeIcon = typeIcons[touchpoint.type];
									const SourceIcon = sourceIcons[touchpoint.source];
									
									return (
										<TableRow key={touchpoint.id}>
											<TableCell>
												<div className="flex items-center gap-2">
													<User className="h-4 w-4 text-muted-foreground" />
													<div>
														<p className="font-medium">
															{touchpoint.students?.full_name || "Unknown"}
														</p>
														<p className="text-xs text-muted-foreground">
															{touchpoint.students?.email || touchpoint.students?.mobile_phone_number || "No contact"}
														</p>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<p className="text-sm">
													{format(new Date(touchpoint.occurred_at), "MMM d, yyyy")}
												</p>
												<p className="text-xs text-muted-foreground">
													{format(new Date(touchpoint.occurred_at), "h:mm a")}
												</p>
											</TableCell>
											<TableCell>
												<Badge variant={getChannelColor(touchpoint.channel) as any} className="gap-1">
													<ChannelIcon className="h-3 w-3" />
													{channelLabels[touchpoint.channel]}
												</Badge>
											</TableCell>
											<TableCell>
												<Badge variant={getTypeColor(touchpoint.type) as any} className="gap-1">
													<TypeIcon className="h-3 w-3" />
													{typeLabels[touchpoint.type]}
												</Badge>
											</TableCell>
											<TableCell className="max-w-xs">
												<p className="text-sm truncate" title={touchpoint.message}>
													{touchpoint.message}
												</p>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-1">
													<SourceIcon className="h-4 w-4 text-muted-foreground" />
													<span className="text-sm">
														{sourceLabels[touchpoint.source]}
													</span>
												</div>
											</TableCell>
											<TableCell>
												{touchpoint.automated_follow_ups ? (
													<Link 
														href={`/admin/automation/automated-follow-ups/${touchpoint.automated_follow_up_id}`}
														className="text-sm text-primary hover:underline"
													>
														{touchpoint.automated_follow_ups.template_follow_up_sequences?.display_name || "View"}
													</Link>
												) : (
													<span className="text-sm text-muted-foreground">-</span>
												)}
											</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<Link href={`/admin/automation/touchpoints/${touchpoint.id}`}>
															<DropdownMenuItem>
																<Eye className="mr-2 h-4 w-4" />
																View
															</DropdownMenuItem>
														</Link>
														<Link href={`/admin/automation/touchpoints/${touchpoint.id}/edit`}>
															<DropdownMenuItem>
																<Edit className="mr-2 h-4 w-4" />
																Edit
															</DropdownMenuItem>
														</Link>
														<DropdownMenuItem 
															onClick={() => handleDelete(touchpoint.id)}
															className="text-destructive"
														>
															<Trash className="mr-2 h-4 w-4" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
				</Table>
				
				{data && data.meta?.totalPages > 1 && (
					<div className="p-4 border-t border-border/50 flex items-center justify-between">
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
		</div>
	);
}