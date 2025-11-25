"use client";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { announcementCategories } from "@/features/shared/data/mock-data";

import { Building2, GraduationCap, Megaphone } from "lucide-react";

interface CategorySidebarProps {
	selectedCategory: string;
	onCategoryChange: (category: string) => void;
}

const categoryIcons: Record<string, typeof Megaphone> = {
	all: Megaphone,
	school_wide: Building2,
	cohort: GraduationCap,
};

export function CategorySidebar({
	selectedCategory,
	onCategoryChange,
}: CategorySidebarProps) {
	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-base">Category</CardTitle>
			</CardHeader>
			<CardContent className="space-y-1">
				{announcementCategories.map((category) => {
					const Icon = categoryIcons[category.id] || Megaphone;
					const isSelected = selectedCategory === category.id;

					return (
						<Button
							key={category.id}
							variant={isSelected ? "secondary" : "ghost"}
							className={cn(
								"w-full justify-start gap-3",
								isSelected && "bg-primary/10 text-primary hover:bg-primary/15",
							)}
							onClick={() => onCategoryChange(category.id)}
						>
							<Icon className="h-4 w-4" />
							<span className="flex-1 text-left">{category.label}</span>
							<span
								className={cn(
									"flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 font-medium text-xs",
									isSelected
										? "bg-primary text-primary-foreground"
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
