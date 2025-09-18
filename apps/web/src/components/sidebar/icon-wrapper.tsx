"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";

type IconWrapperProps = {
	name: string;
	size?: number;
	className?: string;
};

export function IconWrapper({ name, size = 16, className }: IconWrapperProps) {
	const [Icon, setIcon] = useState<LucideIcon | null>(null);

	useEffect(() => {
		const loadIcon = async () => {
			try {
				const icons = await import("lucide-react");
				const IconComponent = (icons as any)[name] || icons.Circle;
				setIcon(() => IconComponent);
			} catch (error) {
				console.error(`Failed to load icon: ${name}`, error);
			}
		};
		loadIcon();
	}, [name]);

	// Return a placeholder with the same dimensions to prevent layout shift
	if (!Icon) {
		return <div style={{ width: size, height: size }} className={className} aria-hidden />;
	}

	return <Icon size={size} className={className} aria-hidden />;
}