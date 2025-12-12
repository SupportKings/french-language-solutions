"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { mockWorkplanItems } from "@/features/shared/data/mock-data";

import { format, isToday, parseISO } from "date-fns";
import { BookOpen, Calendar, ClipboardCheck } from "lucide-react";

const iconMap = {
	class: Calendar,
	assignment: BookOpen,
	evaluation: ClipboardCheck,
};

const colorMap = {
	class: "bg-primary/10 text-primary",
	assignment: "bg-amber-500/10 text-amber-600",
	evaluation: "bg-secondary/10 text-secondary",
};

export function TodayWorkplan() {
	const todayItems = mockWorkplanItems.filter((item) =>
		isToday(parseISO(item.dueDate)),
	);

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base">
					<span>Today's Focus</span>
					<span className="font-normal text-muted-foreground text-sm">
						{format(new Date(), "MMM d")}
					</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{todayItems.length === 0 ? (
					<p className="py-4 text-center text-muted-foreground text-sm">
						No tasks scheduled for today
					</p>
				) : (
					todayItems.map((item) => {
						const Icon = iconMap[item.type];
						const colorClass = colorMap[item.type];
						return (
							<div
								key={item.id}
								className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3"
							>
								<div
									className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colorClass}`}
								>
									<Icon className="h-4 w-4" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="font-medium text-sm">{item.title}</p>
									{item.subtitle && (
										<p className="text-muted-foreground text-xs">
											{item.subtitle}
										</p>
									)}
									{item.cohortName && (
										<p className="mt-1 text-muted-foreground text-xs">
											{item.cohortName}
										</p>
									)}
								</div>
								<span className="shrink-0 text-muted-foreground text-xs">
									{format(parseISO(item.dueDate), "h:mm a")}
								</span>
							</div>
						);
					})
				)}
			</CardContent>
		</Card>
	);
}
