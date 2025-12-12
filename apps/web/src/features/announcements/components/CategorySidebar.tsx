"use client";

import { cn } from "@/lib/utils";

import type { Database } from "@/utils/supabase/database.types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Building2, GraduationCap, Megaphone } from "lucide-react";

type AnnouncementScope = Database["public"]["Enums"]["announcement_scope"];

interface Category {
	id: "all" | AnnouncementScope;
	label: string;
	count: number;
}

interface CategorySidebarProps {
	selectedCategory: "all" | AnnouncementScope;
	onCategoryChange: (category: "all" | AnnouncementScope) => void;
	categories: Category[];
}

const categoryIcons: Record<string, typeof Megaphone> = {
	all: Megaphone,
	school_wide: Building2,
	cohort: GraduationCap,
};

export function CategorySidebar({
	selectedCategory,
	onCategoryChange,
	categories,
}: CategorySidebarProps) {
	return (
		<Card className="overflow-hidden">
			<CardHeader className="px-4 pt-4 pb-2">
				<CardTitle className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
					Category
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-0.5 px-2 pb-2">
				{categories.map((category) => {
					const Icon = categoryIcons[category.id] || Megaphone;
					const isSelected = selectedCategory === category.id;

					return (
						<Button
							key={category.id}
							variant="ghost"
							className={cn(
								"h-10 w-full justify-start gap-2.5 rounded-lg px-3 transition-all duration-150",
								isSelected
									? "bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground"
									: "font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground",
							)}
							onClick={() => onCategoryChange(category.id)}
						>
							<Icon className="h-4 w-4 shrink-0" />
							<span className="flex-1 text-left text-sm">{category.label}</span>
							<span
								className={cn(
									"flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 font-semibold text-xs",
									isSelected
										? "bg-primary-foreground/20 text-primary-foreground"
										: "bg-muted text-muted-foreground",
								)}
							>
								{category.count}
							</span>
						</Button>
					);
				})}
			</CardContent>
		</Card>
	);
}
