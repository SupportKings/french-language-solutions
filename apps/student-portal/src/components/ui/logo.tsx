import Image from "next/image";

import { siteConfig } from "@/siteConfig";

interface LogoProps {
	width?: number;
	height?: number;
	className?: string;
	alt?: string;
}

export function Logo({
	width = 48,
	height = 48,
	className = "",
	alt,
}: LogoProps) {
	const logoAlt = alt || `${siteConfig.name} logo`;

	return (
		<div
			className={`relative flex items-center justify-center ${className}`}
			style={{ width, height }}
		>
			{/* Light mode logo (default) */}
			<Image
				src={siteConfig.logo.light}
				alt={logoAlt}
				width={width}
				height={height}
				className="block object-contain dark:hidden"
				style={{ maxWidth: "100%", height: "auto" }}
			/>

			{/* Dark mode logo */}
			<Image
				src={siteConfig.logo.dark}
				alt={logoAlt}
				width={width}
				height={height}
				className="hidden object-contain dark:block"
				style={{ maxWidth: "100%", height: "auto" }}
			/>
		</div>
	);
}
