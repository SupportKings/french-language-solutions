"use client";

import React, { useCallback, useRef, useState, useTransition } from "react";

import { cn } from "@/lib/utils";

import { RichTextEditor } from "@/components/rich-text-editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import {
	Check,
	ChevronsUpDown,
	FileIcon,
	ImageIcon,
	Loader2,
	Upload,
	VideoIcon,
	X,
} from "lucide-react";
import { toast } from "sonner";
import { createAnnouncement, uploadAttachment } from "../actions";
import { announcementsKeys } from "../queries/announcements.queries";

interface Cohort {
	id: string;
	nickname: string | null;
	product?: {
		level?: string | null;
		format?: string | null;
		location?: string | null;
	} | null;
}

interface CreateAnnouncementDialogProps {
	trigger?: React.ReactNode;
	canPostSchoolWide?: boolean;
}

interface AttachmentFile {
	fileName: string;
	fileUrl: string;
	fileType: "image" | "video" | "document";
	fileSize: number;
	preview?: string;
}

// Helper function to format cohort display text
function getCohortDisplayName(cohort: Cohort): string {
	if (cohort.nickname) {
		return cohort.nickname;
	}

	// For unnamed cohorts, show product details
	const parts: string[] = [];
	if (cohort.product?.level) parts.push(cohort.product.level);
	if (cohort.product?.format) parts.push(cohort.product.format);
	if (cohort.product?.location) parts.push(cohort.product.location);

	return parts.length > 0 ? parts.join(" • ") : cohort.id.substring(0, 8);
}

export function CreateAnnouncementDialog({
	trigger,
	canPostSchoolWide = true,
}: CreateAnnouncementDialogProps) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState<any>(null);
	// Default to cohort scope if user can't post school-wide
	const [scope, setScope] = useState<"school_wide" | "cohort">(
		canPostSchoolWide ? "cohort" : "cohort",
	);
	const [cohortId, setCohortId] = useState<string>("");
	const [isPinned, setIsPinned] = useState(false);
	const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [cohortSearchOpen, setCohortSearchOpen] = useState(false);
	const [cohortSearchValue, setCohortSearchValue] = useState("");
	const [isPending, startTransition] = useTransition();

	const queryClient = useQueryClient();
	const observerTarget = useRef<HTMLDivElement>(null);

	// Debounce search value to avoid too many API calls
	const debouncedSearch = useDebounce(cohortSearchValue, 300);

	// Infinite query for cohorts
	const {
		data: cohortsData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: isLoadingCohorts,
	} = useInfiniteQuery({
		queryKey: ["cohorts-for-announcements", debouncedSearch],
		queryFn: async ({ pageParam = 1 }) => {
			const params = new URLSearchParams({
				page: String(pageParam),
				limit: "20",
			});

			if (debouncedSearch) {
				params.append("search", debouncedSearch);
			}

			const response = await fetch(`/api/cohorts?${params.toString()}`);
			if (!response.ok) {
				throw new Error("Failed to fetch cohorts");
			}

			const result = await response.json();

			// Transform data to include product details
			const transformedCohorts = result.data.map((cohort: any) => ({
				id: cohort.id,
				nickname: cohort.nickname,
				product: {
					level: cohort.current_level?.display_name || null,
					format: cohort.products?.format || null,
					location: cohort.products?.location || null,
				},
			}));

			return {
				cohorts: transformedCohorts,
				nextPage:
					result.meta.page < result.meta.totalPages ? pageParam + 1 : null,
			};
		},
		getNextPageParam: (lastPage) => lastPage.nextPage,
		initialPageParam: 1,
		enabled: scope === "cohort" && cohortSearchOpen,
	});

	// Flatten all cohorts from all pages
	const allCohorts = cohortsData?.pages.flatMap((page) => page.cohorts) || [];
	const selectedCohort = allCohorts.find((c) => c.id === cohortId);

	// Intersection observer for infinite scroll
	const handleObserver = useCallback(
		(entries: IntersectionObserverEntry[]) => {
			const [target] = entries;
			if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
				fetchNextPage();
			}
		},
		[fetchNextPage, hasNextPage, isFetchingNextPage],
	);

	// Setup intersection observer
	React.useEffect(() => {
		const element = observerTarget.current;
		if (!element) return;

		const observer = new IntersectionObserver(handleObserver, {
			threshold: 0.5,
		});

		observer.observe(element);

		return () => {
			if (element) {
				observer.unobserve(element);
			}
		};
	}, [handleObserver]);

	const reset = () => {
		setTitle("");
		setContent(null);
		setScope("cohort");
		setCohortId("");
		setIsPinned(false);
		setAttachments([]);
		setCohortSearchValue("");
	};

	const handleFileUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const files = event.target.files;
		if (!files || files.length === 0) return;

		setIsUploading(true);

		try {
			const uploadPromises = Array.from(files).map(async (file) => {
				const result = await uploadAttachment({ file });

				if (result?.data?.data) {
					const fileData = result.data.data;
					return {
						fileName: fileData.fileName,
						fileUrl: fileData.fileUrl,
						fileType: fileData.fileType,
						fileSize: fileData.fileSize,
					};
				}
				return null;
			});

			const uploaded = await Promise.all(uploadPromises);
			const validUploads = uploaded.filter(
				(f) => f !== null,
			) as AttachmentFile[];

			setAttachments((prev) => [...prev, ...validUploads]);
			toast.success(`${validUploads.length} file(s) uploaded successfully`);
		} catch (error) {
			toast.error("Failed to upload files");
			console.error(error);
		} finally {
			setIsUploading(false);
		}
	};

	const removeAttachment = (index: number) => {
		setAttachments((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = () => {
		if (!title.trim()) {
			toast.error("Please enter a title");
			return;
		}

		if (!content) {
			toast.error("Please enter content");
			return;
		}

		if (scope === "cohort" && !cohortId) {
			toast.error("Please select a cohort");
			return;
		}

		startTransition(async () => {
			try {
				// Convert TipTap JSON to HTML string for storage
				const contentHTML = JSON.stringify(content);

				const result = await createAnnouncement({
					title,
					content: contentHTML,
					scope,
					cohortId: scope === "cohort" ? cohortId : null,
					isPinned,
					attachments,
				});

				if (result?.data) {
					toast.success("Announcement created successfully");
					queryClient.invalidateQueries({
						queryKey: announcementsKeys.lists(),
					});
					reset();
					setOpen(false);
				}
			} catch (error) {
				toast.error("Failed to create announcement");
				console.error(error);
			}
		});
	};

	const getFileIcon = (fileType: string) => {
		if (fileType === "image") return <ImageIcon className="h-4 w-4" />;
		if (fileType === "video") return <VideoIcon className="h-4 w-4" />;
		return <FileIcon className="h-4 w-4" />;
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || <Button>Create Announcement</Button>}
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create New Announcement</DialogTitle>
					<DialogDescription>
						Share important updates with students
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Title */}
					<div className="space-y-2">
						<Label htmlFor="title">
							Title <span className="text-destructive">*</span>
						</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Enter announcement title"
						/>
					</div>

					{/* Content */}
					<div className="space-y-2">
						<Label>
							Content <span className="text-destructive">*</span>
						</Label>
						<RichTextEditor
							content={content}
							onChange={setContent}
							placeholder="Write your announcement..."
							className="min-h-[200px]"
						/>
					</div>

					{/* Scope */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="scope">
								Scope <span className="text-destructive">*</span>
							</Label>
							{canPostSchoolWide ? (
								<Select
									value={scope}
									onValueChange={(value: "school_wide" | "cohort") => {
										setScope(value);
										if (value === "school_wide") {
											setCohortId("");
										}
									}}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="school_wide">School-wide</SelectItem>
										<SelectItem value="cohort">Specific Cohort</SelectItem>
									</SelectContent>
								</Select>
							) : (
								<div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
									Specific Cohort
								</div>
							)}
						</div>

						{/* Cohort Selection */}
						{scope === "cohort" && (
							<div className="space-y-2">
								<Label htmlFor="cohort">
									Cohort <span className="text-destructive">*</span>
								</Label>
								<Popover
									open={cohortSearchOpen}
									onOpenChange={setCohortSearchOpen}
								>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											role="combobox"
											aria-expanded={cohortSearchOpen}
											className="w-full justify-between"
										>
											{selectedCohort
												? getCohortDisplayName(selectedCohort)
												: "Select cohort..."}
											<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-[400px] p-0">
										<Command shouldFilter={false}>
											<CommandInput
												placeholder="Search cohorts..."
												value={cohortSearchValue}
												onValueChange={setCohortSearchValue}
											/>
											<CommandList className="max-h-[300px] overflow-y-auto">
												{isLoadingCohorts ? (
													<div className="flex items-center justify-center p-4">
														<Loader2 className="h-5 w-5 animate-spin" />
													</div>
												) : allCohorts.length === 0 ? (
													<CommandEmpty>No cohort found.</CommandEmpty>
												) : (
													<CommandGroup>
														{allCohorts.map((cohort) => (
															<CommandItem
																key={cohort.id}
																value={cohort.id}
																onSelect={() => {
																	setCohortId(cohort.id);
																	setCohortSearchOpen(false);
																}}
															>
																<Check
																	className={cn(
																		"mr-2 h-4 w-4",
																		cohortId === cohort.id
																			? "opacity-100"
																			: "opacity-0",
																	)}
																/>
																{getCohortDisplayName(cohort)}
															</CommandItem>
														))}
														{/* Observer target for infinite scroll */}
														<div ref={observerTarget} className="h-1" />
														{isFetchingNextPage && (
															<div className="flex items-center justify-center p-2">
																<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
															</div>
														)}
													</CommandGroup>
												)}
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
							</div>
						)}
					</div>

					{/* Pin Checkbox */}
					<div className="flex items-center space-x-2">
						<Checkbox
							id="pinned"
							checked={isPinned}
							onCheckedChange={(checked) => setIsPinned(checked as boolean)}
						/>
						<Label
							htmlFor="pinned"
							className="cursor-pointer font-normal text-sm"
						>
							Pin this announcement (appears first)
						</Label>
					</div>

					{/* File Upload */}
					<div className="space-y-2">
						<Label>Attachments (optional)</Label>
						<div className="flex items-center gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={isUploading}
								onClick={() => document.getElementById("file-upload")?.click()}
							>
								{isUploading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Uploading...
									</>
								) : (
									<>
										<Upload className="mr-2 h-4 w-4" />
										Upload Files
									</>
								)}
							</Button>
							<input
								id="file-upload"
								type="file"
								multiple
								accept="image/*,video/*,.pdf,.doc,.docx"
								onChange={handleFileUpload}
								className="hidden"
							/>
						</div>

						{/* Attachments List */}
						{attachments.length > 0 && (
							<div className="mt-2 space-y-2">
								{attachments.map((attachment, index) => (
									<div
										key={index}
										className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2"
									>
										{attachment.fileType === "image" ? (
											<img
												src={attachment.fileUrl}
												alt={attachment.fileName}
												className="h-10 w-10 rounded object-cover"
											/>
										) : (
											<div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
												{getFileIcon(attachment.fileType)}
											</div>
										)}
										<div className="min-w-0 flex-1">
											<p className="truncate font-medium text-sm">
												{attachment.fileName}
											</p>
										</div>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => removeAttachment(index)}
											className="h-8 w-8 p-0"
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => {
							reset();
							setOpen(false);
						}}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isPending || isUploading}>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Creating...
							</>
						) : (
							"Create Announcement"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
