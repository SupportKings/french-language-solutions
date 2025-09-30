"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useProduct } from "@/features/products/queries/products.queries";
import type { Product } from "@/features/products/schemas/product.schema";

import { format } from "date-fns";
import {
	BookOpen,
	ChevronRight,
	Clock,
	FileText,
	Globe,
	Link as LinkIcon,
	MapPin,
	MoreVertical,
	Package,
	School,
	Trash2,
	Users,
	Video,
} from "lucide-react";
import { toast } from "sonner";

interface ProductDetailPageClientProps {
	productId: string;
}

// Format options for display
const formatOptions = [
	{ value: "group", label: "Group" },
	{ value: "private", label: "Private" },
	{ value: "hybrid", label: "Hybrid" },
];

// Location options for display
const locationOptions = [
	{ value: "online", label: "Online" },
	{ value: "in_person", label: "In-Person" },
	{ value: "hybrid", label: "Hybrid" },
];

// Format display helpers
const formatProductFormat = (format: string) => {
	return format.charAt(0).toUpperCase() + format.slice(1);
};

const formatProductLocation = (location: string) => {
	if (location === "in_person") return "In-Person";
	return location.charAt(0).toUpperCase() + location.slice(1);
};

// Get format icon
const getFormatIcon = (format: string) => {
	switch (format) {
		case "group":
			return <Users className="h-4 w-4 text-primary" />;
		case "private":
			return <BookOpen className="h-4 w-4 text-primary" />;
		case "hybrid":
			return <School className="h-4 w-4 text-primary" />;
		default:
			return <Package className="h-4 w-4 text-primary" />;
	}
};

// Get location icon
const getLocationIcon = (location: string) => {
	switch (location) {
		case "online":
			return <Video className="h-4 w-4 text-primary" />;
		case "in_person":
			return <MapPin className="h-4 w-4 text-primary" />;
		case "hybrid":
			return <Globe className="h-4 w-4 text-primary" />;
		default:
			return <Globe className="h-4 w-4 text-primary" />;
	}
};

export function ProductDetailPageClient({
	productId,
}: ProductDetailPageClientProps) {
	const router = useRouter();
	const {
		data: productData,
		isLoading,
		error,
		isSuccess,
	} = useProduct(productId);
	const [product, setProduct] = useState<Product | null>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Local state for edited values
	const [editedProduct, setEditedProduct] = useState<any>(null);

	// Update the product when data changes
	useEffect(() => {
		if (productData) {
			setProduct(productData);
			setEditedProduct(productData); // Initialize edited state
		}
	}, [productData]);

	// Update edited product field locally
	const updateEditedField = async (field: string, value: any) => {
		setEditedProduct({
			...editedProduct,
			[field]: value,
		});
		// Return a resolved promise to match the expected type
		return Promise.resolve();
	};

	// Save all changes to the API
	const saveAllChanges = async () => {
		try {
			// Collect all changes
			const changes: any = {};

			// Check for changes in basic fields
			if (editedProduct.display_name !== product?.display_name) {
				changes.display_name = editedProduct.display_name;
			}
			if (editedProduct.format !== product?.format) {
				changes.format = editedProduct.format;
			}
			if (editedProduct.location !== product?.location) {
				changes.location = editedProduct.location;
			}
			if (
				editedProduct.pandadoc_contract_template_id !==
				product?.pandadoc_contract_template_id
			) {
				changes.pandadoc_contract_template_id =
					editedProduct.pandadoc_contract_template_id || null;
			}
			if (
				editedProduct.signup_link_for_self_checkout !==
				product?.signup_link_for_self_checkout
			) {
				changes.signup_link_for_self_checkout =
					editedProduct.signup_link_for_self_checkout || null;
			}

			// If no changes, return early
			if (Object.keys(changes).length === 0) {
				return;
			}

			const response = await fetch(`/api/products/${productId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(changes),
			});

			if (!response.ok) throw new Error("Failed to update");

			const updated = await response.json();
			setProduct(updated);
			setEditedProduct(updated);
			toast.success("Changes saved successfully");
		} catch (error) {
			toast.error("Failed to save changes");
			throw error;
		}
	};

	// Delete product
	const handleDeleteProduct = async () => {
		setIsDeleting(true);
		try {
			const response = await fetch(`/api/products/${productId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete product");
			}

			toast.success("Product deleted successfully");
			router.push("/admin/configuration/products");
			router.refresh();
		} catch (error: any) {
			toast.error(error.message || "Failed to delete product");
		} finally {
			setIsDeleting(false);
			setShowDeleteConfirm(false);
		}
	};

	// Show loading skeleton while loading
	if (isLoading) {
		return (
			<div className="min-h-screen bg-muted/30">
				{/* Header Skeleton */}
				<div className="border-b bg-background">
					<div className="px-6 py-3">
						<div className="animate-pulse">
							{/* Breadcrumb skeleton */}
							<div className="mb-2 flex items-center gap-2">
								<div className="h-4 w-16 rounded bg-muted" />
								<div className="h-3 w-3 rounded bg-muted" />
								<div className="h-4 w-24 rounded bg-muted" />
							</div>
							{/* Title and badges skeleton */}
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-full bg-muted" />
									<div>
										<div className="flex items-center gap-2">
											<div className="h-4 w-20 rounded bg-muted" />
											<div className="h-4 w-16 rounded bg-muted" />
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<div className="h-9 w-9 rounded bg-muted" />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Content Skeleton */}
				<div className="space-y-4 px-6 py-4">
					{/* Product Information Section Skeleton */}
					<div className="rounded-lg border bg-card">
						<div className="border-b p-4">
							<div className="h-5 w-40 rounded bg-muted" />
						</div>
						<div className="p-6">
							<div className="grid animate-pulse gap-8 lg:grid-cols-3">
								{[1, 2, 3].map((col) => (
									<div key={col} className="space-y-4">
										<div className="mb-4 h-3 w-24 rounded bg-muted" />
										{[1, 2, 3].map((i) => (
											<div key={i} className="flex items-start gap-3">
												<div className="mt-0.5 h-4 w-4 rounded bg-muted" />
												<div className="flex-1 space-y-1">
													<div className="h-3 w-16 rounded bg-muted" />
													<div className="h-4 w-24 rounded bg-muted" />
												</div>
											</div>
										))}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Show error state
	if ((isSuccess && !productData) || error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-muted/30">
				<div className="text-center">
					<Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
					<h2 className="mb-2 font-semibold text-lg">Product not found</h2>
					<p className="mb-4 text-muted-foreground">
						The product you're looking for doesn't exist or couldn't be loaded.
					</p>
					<Button onClick={() => router.push("/admin/configuration/products")}>
						Back to Products
					</Button>
				</div>
			</div>
		);
	}

	// If somehow we get here without product, return null to avoid errors
	if (!product) {
		return null;
	}

	// Get initials for avatar
	const initials = product.display_name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<div className="min-h-screen bg-muted/30">
			{/* Enhanced Header with Breadcrumb */}
			<div className="border-b bg-background">
				<div className="px-6 py-3">
					<div className="mb-2 flex items-center gap-2 text-muted-foreground text-sm">
						<Link
							href="/admin/cohorts"
							className="transition-colors hover:text-foreground"
						>
							Classes
						</Link>
						<ChevronRight className="h-3 w-3" />
						<Link
							href="/admin/configuration/products"
							className="transition-colors hover:text-foreground"
						>
							Products
						</Link>
						<ChevronRight className="h-3 w-3" />
						<span>{product.display_name}</span>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div>
								<h1 className="font-semibold text-xl">
									{product.display_name}
								</h1>
								<div className="mt-0.5 flex items-center gap-2">
									<Badge variant="outline" className="h-4 px-1.5 text-[10px]">
										{getFormatIcon(product.format)}
										<span className="ml-1">
											{formatProductFormat(product.format)}
										</span>
									</Badge>
									<Badge variant="outline" className="h-4 px-1.5 text-[10px]">
										{getLocationIcon(product.location)}
										<span className="ml-1">
											{formatProductLocation(product.location)}
										</span>
									</Badge>
								</div>
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
									<DropdownMenuItem
										className="text-destructive focus:text-destructive"
										onClick={() => setShowDeleteConfirm(true)}
									>
										<Trash2 className="mr-2 h-3.5 w-3.5" />
										Delete Product
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>
			</div>

			<div className="space-y-4 px-6 py-4">
				{/* Product Information with inline editing */}
				<EditableSection
					title="Product Information"
					onEditStart={() => {
						// Reset to current values when starting to edit
						setEditedProduct(product);
					}}
					onSave={saveAllChanges}
					onCancel={() => {
						// Reset to original values when canceling
						setEditedProduct(product);
					}}
				>
					{(editing) => (
						<div className="grid gap-8 lg:grid-cols-3">
							{/* Basic Details */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Basic Details
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<Package className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Product Name:
											</p>
											{editing ? (
												<InlineEditField
													value={editedProduct?.display_name || ""}
													onSave={(value) =>
														updateEditedField("display_name", value)
													}
													editing={editing}
													type="text"
													placeholder="Product name"
												/>
											) : (
												<p className="font-medium text-sm">
													{product.display_name}
												</p>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Format:</p>
											{editing ? (
												<InlineEditField
													value={editedProduct?.format}
													onSave={(value) => updateEditedField("format", value)}
													editing={editing}
													type="select"
													options={formatOptions}
												/>
											) : (
												<Badge variant="outline" className="h-5 text-xs">
													{formatProductFormat(product.format)}
												</Badge>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Location:</p>
											{editing ? (
												<InlineEditField
													value={editedProduct?.location}
													onSave={(value) =>
														updateEditedField("location", value)
													}
													editing={editing}
													type="select"
													options={locationOptions}
												/>
											) : (
												<Badge variant="outline" className="h-5 text-xs">
													{formatProductLocation(product.location)}
												</Badge>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Integration Details */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Integrations
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												PandaDoc Template ID:
											</p>
											{editing ? (
												<InlineEditField
													value={
														editedProduct?.pandadoc_contract_template_id || ""
													}
													onSave={(value) =>
														updateEditedField(
															"pandadoc_contract_template_id",
															value || null,
														)
													}
													editing={editing}
													type="text"
													placeholder="Enter template ID"
												/>
											) : product.pandadoc_contract_template_id ? (
												<p className="font-mono text-xs">
													{product.pandadoc_contract_template_id}
												</p>
											) : (
												<span className="text-muted-foreground text-sm">
													Not configured
												</span>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<LinkIcon className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Self-Checkout Link:
											</p>
											{editing ? (
												<InlineEditField
													value={
														editedProduct?.signup_link_for_self_checkout || ""
													}
													onSave={(value) =>
														updateEditedField(
															"signup_link_for_self_checkout",
															value || null,
														)
													}
													editing={editing}
													type="text"
													placeholder="https://..."
												/>
											) : product.signup_link_for_self_checkout ? (
												<Button
													size="sm"
													variant="outline"
													className="h-7"
													onClick={() =>
														window.open(
															product.signup_link_for_self_checkout || "",
															"_blank",
														)
													}
												>
													<LinkIcon className="mr-1.5 h-3 w-3" />
													Open Self-Checkout
												</Button>
											) : (
												<span className="text-muted-foreground text-sm">
													No link configured
												</span>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</EditableSection>

				{/* System Information - Less prominent at the bottom */}
				<div className="mt-8 border-t pt-6">
					<div className="mx-auto max-w-3xl">
						<div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground/70 text-xs">
							<div className="flex items-center gap-2">
								<Clock className="h-3 w-3" />
								<span>Created at:</span>
								<span>
									{format(
										new Date(product.created_at),
										"MMM d, yyyy 'at' h:mm a",
									)}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="h-3 w-3" />
								<span>Updated at:</span>
								<span>
									{format(
										new Date(product.updated_at),
										"MMM d, yyyy 'at' h:mm a",
									)}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Product</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this product? This action cannot
							be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteProduct}
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
