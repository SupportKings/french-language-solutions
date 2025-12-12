"use client";

import type React from "react";

import { cn } from "@/lib/utils";

import { AnimatePresence, motion } from "motion/react";

interface AnimatedListProps {
	children: React.ReactNode;
	className?: string;
}

export function AnimatedList({ children, className }: AnimatedListProps) {
	return (
		<div className={cn("divide-y", className)}>
			<AnimatePresence initial={false} mode="popLayout">
				{children as any}
			</AnimatePresence>
		</div>
	);
}

interface AnimatedListItemProps {
	children: React.ReactNode;
	className?: string;
	itemKey: string | number;
}

export function AnimatedListItem({
	children,
	className,
	itemKey,
}: AnimatedListItemProps) {
	return (
		<motion.div
			key={itemKey}
			layout
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{
				opacity: { duration: 0.15 },
				layout: { duration: 0.2, type: "spring", stiffness: 300, damping: 30 },
			}}
			className={cn(className)}
		>
			{children as any}
		</motion.div>
	);
}
