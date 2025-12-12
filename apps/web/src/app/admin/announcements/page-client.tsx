"use client";

import { useMemo, useState } from "react";

import type { Database } from "@/utils/supabase/database.types";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
	AnnouncementCard,
	CategorySidebar,
	CreateAnnouncementDialog,
	EditAnnouncementDialog,
	ReadStatsDialog,
} from "@/features/announcements/components";
import { announcementsQueries } from "@/features/announcements/queries/announcements.queries";

import { useQuery } from "@tanstack/react-query";
import { parseISO } from "date-fns";
import { Bell, Calendar, Plus, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

type AnnouncementScope = Database["public"]["Enums"]["announcement_scope"];
type SortOption = "newest" | "oldest";

interface AnnouncementsPageClientProps {
	userId: string;
}

export function AnnouncementsPageClient({ userId }: AnnouncementsPageClientProps) {
	const [selectedCategory, setSelectedCategory] = useState<
		"all" | AnnouncementScope
	>("all");
	const [sortBy, setSortBy] = useState<SortOption>("newest");
	const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<
		string | null
	>(null);
	const [editingAnnouncementId, setEditingAnnouncementId] = useState<
		string | null
	>(null);

	// Fetch all announcements (no filter - we filter client-side for categories)
	const { data: allAnnouncements = [], isLoading } = useQuery(
		announcementsQueries.list(),
	);

	// Filter and sort announcements
	const filteredAnnouncements = useMemo(() => {
		let filtered = [...allAnnouncements];

		// Filter by category
		if (selectedCategory !== "all") {
			filtered = filtered.filter((a) => a.scope === selectedCategory);
		}

		// Sort: pinned first, then by date
		filtered.sort((a, b) => {
			// Pinned first
			if (a.is_pinned && !b.is_pinned) return -1;
			if (!a.is_pinned && b.is_pinned) return 1;

			// Then by date
			const dateA = parseISO(a.created_at).getTime();
			const dateB = parseISO(b.created_at).getTime();
			return sortBy === "newest" ? dateB - dateA : dateA - dateB;
		});

		return filtered;
	}, [allAnnouncements, selectedCategory, sortBy]);

	// Calculate category counts
	const categories = useMemo(
		() => [
			{
				id: "all" as const,
				label: "All Announcements",
				count: allAnnouncements.length,
			},
			{
				id: "school_wide" as const,
				label: "School-wide",
				count: allAnnouncements.filter((a) => a.scope === "school_wide").length,
			},
			{
				id: "cohort" as const,
				label: "Cohort Updates",
				count: allAnnouncements.filter((a) => a.scope === "cohort").length,
			},
		],
		[allAnnouncements],
	);

	return (
		<div className="min-h-screen bg-muted/30">
			<div className="grid gap-6 p-6 lg:grid-cols-[240px_1fr]">
				{/* Left Sidebar - Categories */}
				<div className="hidden lg:block">
					<div className="sticky top-20 space-y-4">
						<CategorySidebar
							selectedCategory={selectedCategory}
							onCategoryChange={setSelectedCategory}
							categories={categories}
						/>

						{/* Create button for sidebar */}
						<CreateAnnouncementDialog
							trigger={
								<Button className="w-full gap-2 shadow-sm">
									<Plus className="h-4 w-4" />
									Create Announcement
								</Button>
							}
						/>
					</div>
				</div>

				{/* Main Content - Feed */}
				<div className="space-y-4">
					{/* Mobile Category Filter */}
					<div className="flex items-center justify-between lg:hidden">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="gap-2">
									<SlidersHorizontal className="h-4 w-4" />
									Filter
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start">
								<DropdownMenuLabel>Category</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={() => setSelectedCategory("all")}>
									All Announcements
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setSelectedCategory("school_wide")}
								>
									School-wide
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setSelectedCategory("cohort")}>
									Cohort Updates
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="gap-2">
									<Calendar className="h-4 w-4" />
									Sort
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => setSortBy("newest")}>
									Newest first
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setSortBy("oldest")}>
									Oldest first
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<CreateAnnouncementDialog
							trigger={
								<Button className="gap-2">
									<Plus className="h-4 w-4" />
									Create
								</Button>
							}
						/>
					</div>

					{/* Sort Options - Desktop */}
					<div className="hidden items-center justify-between lg:flex">
						<p className="text-muted-foreground text-sm">
							{filteredAnnouncements.length} announcement
							{filteredAnnouncements.length !== 1 ? "s" : ""}
						</p>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm" className="gap-2">
									<Calendar className="h-4 w-4" />
									{sortBy === "newest" ? "Newest first" : "Oldest first"}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => setSortBy("newest")}>
									Newest first
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setSortBy("oldest")}>
									Oldest first
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					{/* Announcements List */}
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="text-muted-foreground">
								Loading announcements...
							</div>
						</div>
					) : filteredAnnouncements.length === 0 ? (
						<div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card py-16 text-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
								<Bell className="h-8 w-8 text-muted-foreground" />
							</div>
							<h3 className="mt-4 font-semibold text-lg">No announcements</h3>
							<p className="mt-2 max-w-sm text-muted-foreground text-sm">
								{selectedCategory === "all"
									? "Create your first announcement to get started"
									: "There are no announcements in this category"}
							</p>
							{selectedCategory === "all" && (
								<CreateAnnouncementDialog
									trigger={
										<Button className="mt-6 gap-2">
											<Plus className="h-4 w-4" />
											Create Your First Announcement
										</Button>
									}
								/>
							)}
						</div>
					) : (
						<div className="mx-auto max-w-3xl space-y-4">
							{filteredAnnouncements.map((announcement) => (
								<AnnouncementCard
									key={announcement.id}
									announcement={announcement}
									onViewStats={(id) => setSelectedAnnouncementId(id)}
									onEdit={
										announcement.author?.id === userId
											? (id) => setEditingAnnouncementId(id)
											: undefined
									}
								/>
							))}
						</div>
					)}
				</div>

				{/* Read Stats Dialog */}
				<ReadStatsDialog
					announcementId={selectedAnnouncementId}
					onClose={() => setSelectedAnnouncementId(null)}
				/>

				{/* Edit Announcement Dialog */}
				<EditAnnouncementDialog
					announcement={
						editingAnnouncementId
							? allAnnouncements.find((a) => a.id === editingAnnouncementId) || null
							: null
					}
					open={!!editingAnnouncementId}
					onOpenChange={(open) => {
						if (!open) setEditingAnnouncementId(null);
					}}
				/>
			</div>
		</div>
	);
}
