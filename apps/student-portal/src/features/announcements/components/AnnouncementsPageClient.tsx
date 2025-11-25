"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { AnnouncementCard } from "./AnnouncementCard";
import { CategorySidebar } from "./CategorySidebar";

import { useStudentAnnouncements } from "../queries";

import { parseISO } from "date-fns";
import { Bell, Calendar, SlidersHorizontal } from "lucide-react";

type SortOption = "newest" | "oldest";

interface AnnouncementsPageClientProps {
	studentId: string;
}

export function AnnouncementsPageClient({
	studentId,
}: AnnouncementsPageClientProps) {
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [sortBy, setSortBy] = useState<SortOption>("newest");

	const { data: announcements = [], isLoading } =
		useStudentAnnouncements(studentId);

	const filteredAnnouncements = useMemo(() => {
		let filtered = [...announcements];

		// Filter by category
		if (selectedCategory !== "all") {
			filtered = filtered.filter((a) => a.scope === selectedCategory);
		}

		// Sort: pinned first, then by date
		filtered.sort((a, b) => {
			// Pinned first
			if (a.isPinned && !b.isPinned) return -1;
			if (!a.isPinned && b.isPinned) return 1;

			// Then by date
			const dateA = parseISO(a.createdAt).getTime();
			const dateB = parseISO(b.createdAt).getTime();
			return sortBy === "newest" ? dateB - dateA : dateA - dateB;
		});

		return filtered;
	}, [announcements, selectedCategory, sortBy]);

	const unreadCount = announcements.filter((a) => !a.isRead).length;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-muted-foreground">Loading announcements...</div>
			</div>
		);
	}

	return (
		<div className="grid gap-6 lg:grid-cols-[240px_1fr]">
			{/* Left Sidebar - Categories */}
			<div className="hidden lg:block">
				<div className="sticky top-20 space-y-4">
					<CategorySidebar
						selectedCategory={selectedCategory}
						onCategoryChange={setSelectedCategory}
						announcements={announcements}
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
								Class Updates
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
				</div>

				{/* Sort Options - Desktop */}
				<div className="hidden items-center justify-between lg:flex">
					<p className="text-muted-foreground text-sm">
						{filteredAnnouncements.length} announcement
						{filteredAnnouncements.length !== 1 ? "s" : ""}
						{unreadCount > 0 && (
							<span className="ml-1 text-secondary">
								({unreadCount} unread)
							</span>
						)}
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
				{filteredAnnouncements.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
							<Bell className="h-8 w-8 text-muted-foreground" />
						</div>
						<h3 className="mt-4 font-semibold text-lg">No announcements</h3>
						<p className="mt-1 text-muted-foreground text-sm">
							There are no announcements in this category
						</p>
					</div>
				) : (
					<div className="max-w-3xl space-y-4 mx-auto">
						{filteredAnnouncements.map((announcement) => (
							<AnnouncementCard
								key={announcement.id}
								announcement={announcement}
								studentId={studentId}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
