"use client";

import { useState } from "react";

import Link from "next/link";

import {
	DataTableFilter,
	useDataTableFilters,
} from "@/components/data-table-filter";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { useDebounce } from "@uidotdev/usehooks";
import { format } from "date-fns";
import {
	Building,
	Eye,
	Globe,
	MapPin,
	MoreHorizontal,
	Plus,
	Search,
	Trash,
	Users,
} from "lucide-react";
import type { ProductQuery } from "../queries/useProducts";
import { useDeleteProduct, useProducts } from "../queries/useProducts";

// Product status mappings for display
const FORMAT_LABELS = {
	group: "Group",
	private: "Private",
	hybrid: "Hybrid",
} as const;

const FORMAT_COLORS = {
	group: "info",
	private: "secondary",
	hybrid: "outline",
} as const;

const LOCATION_LABELS = {
	online: "Online",
	in_person: "In-Person",
	hybrid: "Hybrid",
} as const;

const LOCATION_COLORS = {
	online: "info",
	in_person: "secondary",
	hybrid: "outline",
} as const;

// Define column configurations for data-table-filter
const productColumns = [
	{
		id: "format",
		accessor: (product: any) => product.format,
		displayName: "Format",
		icon: Users,
		type: "option" as const,
		options: Object.entries(FORMAT_LABELS).map(([value, label]) => ({
			label,
			value,
		})),
	},
	{
		id: "location",
		accessor: (product: any) => product.location,
		displayName: "Location",
		icon: MapPin,
		type: "option" as const,
		options: Object.entries(LOCATION_LABELS).map(([value, label]) => ({
			label,
			value,
		})),
	},
];

interface ProductsTableProps {
	hideTitle?: boolean;
}

export function ProductsTable({ hideTitle = false }: ProductsTableProps) {
	const [query, setQuery] = useState<ProductQuery>({
		page: 1,
		limit: 20,
		sortBy: "display_name",
		sortOrder: "asc",
	});
	const [searchInput, setSearchInput] = useState("");
	const debouncedSearch = useDebounce(searchInput, 300);
	const [productToDelete, setProductToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	// Data table filters hook
	const { columns, filters, actions, strategy } = useDataTableFilters({
		strategy: "server" as const,
		data: [], // Empty for server-side filtering
		columnsConfig: productColumns,
	});

	// Convert filters to query params
	const filterQuery = {
		format: filters.find((f) => f.columnId === "format")?.values?.length
			? (filters.find((f) => f.columnId === "format")?.values as string[])
			: undefined,
		location: filters.find((f) => f.columnId === "location")?.values?.length
			? (filters.find((f) => f.columnId === "location")?.values as string[])
			: undefined,
	};

	// Update query when debounced search changes or filters change
	const effectiveQuery = {
		...query,
		...filterQuery,
		search: debouncedSearch || undefined,
	};

	const { data, isLoading, error } = useProducts(effectiveQuery);
	const deleteProduct = useDeleteProduct();

	const handleDelete = async () => {
		if (!productToDelete) return;
		setIsDeleting(true);
		try {
			await deleteProduct.mutateAsync(productToDelete);
			setProductToDelete(null);
		} finally {
			setIsDeleting(false);
		}
	};

	if (error) {
		return (
			<Card>
				<CardContent className="py-10">
					<p className="text-center text-muted-foreground">
						Failed to load products
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Table with integrated search, filters and actions */}
			<div className="rounded-md border">
				{/* Combined header with search, filters, and add button */}
				<div className="space-y-2 border-b bg-muted/30 px-4 py-2">
					{/* Search bar and action button */}
					<div className="flex items-center gap-3">
						<div className="relative max-w-sm flex-1">
							<Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search products by name..."
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								className="h-9 bg-muted/50 pl-9"
							/>
						</div>

						<div className="ml-auto">
							<Link href="/admin/cohorts/products/new" passHref>
								<Button size="sm" className="h-9">
									<Plus className="mr-1.5 h-4 w-4" />
									Add Product
								</Button>
							</Link>
						</div>
					</div>

					{/* Filter bar */}
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
							<TableHead>Product Name</TableHead>
							<TableHead>Format</TableHead>
							<TableHead>Location</TableHead>
							<TableHead>Created</TableHead>
							<TableHead className="w-[70px]" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell>
										<Skeleton className="h-5 w-32" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-8" />
									</TableCell>
								</TableRow>
							))
						) : data?.data.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center text-muted-foreground"
								>
									No products found
								</TableCell>
							</TableRow>
						) : (
							data?.data.map((product) => (
								<TableRow
									key={product.id}
									className="transition-colors duration-150 hover:bg-muted/50"
								>
									<TableCell>
										<Link
											href={`/admin/cohorts/products/${product.id}`}
											className="hover:underline"
										>
											<p className="cursor-pointer font-medium transition-colors hover:text-primary">
												{product.display_name}
											</p>
										</Link>
									</TableCell>
									<TableCell>
										<Badge variant={FORMAT_COLORS[product.format] as any}>
											{FORMAT_LABELS[product.format]}
										</Badge>
									</TableCell>
									<TableCell>
										<Badge variant={LOCATION_COLORS[product.location] as any}>
											{LOCATION_LABELS[product.location]}
										</Badge>
									</TableCell>
									<TableCell>
										<p className="text-sm">
											{product.created_at
												? format(new Date(product.created_at), "MMM d, yyyy")
												: "N/A"}
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
												<Link
													href={`/admin/cohorts/products/${product.id}`}
													passHref
												>
													<DropdownMenuItem>
														<Eye className="mr-2 h-4 w-4" />
														View
													</DropdownMenuItem>
												</Link>
												<DropdownMenuItem
													onClick={(e) => {
														e.stopPropagation();
														setProductToDelete(product.id);
													}}
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

				{data && data.meta.totalPages > 1 && (
					<div className="flex items-center justify-between border-t bg-muted/10 px-4 py-3">
						<p className="text-muted-foreground text-sm">
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

			<DeleteConfirmationDialog
				open={!!productToDelete}
				onOpenChange={(open) => !open && setProductToDelete(null)}
				onConfirm={handleDelete}
				title="Delete Product"
				description="Are you sure you want to delete this product?"
				isDeleting={isDeleting}
			/>
		</div>
	);
}
