"use client";

import { Button } from "@/components/ui/button";

import { Copy } from "lucide-react";
import { toast } from "sonner";

interface CopyButtonProps {
	text: string;
	label: string;
}

export function CopyButton({ text, label }: CopyButtonProps) {
	const handleCopy = () => {
		navigator.clipboard.writeText(text);
		toast.success(`${label} copied to clipboard`);
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
			onClick={handleCopy}
		>
			<Copy className="h-3 w-3" />
		</Button>
	);
}

export function CopyButtonSmall({ text, label }: CopyButtonProps) {
	const handleCopy = () => {
		navigator.clipboard.writeText(text);
		toast.success(`${label} copied to clipboard`);
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100"
			onClick={handleCopy}
		>
			<Copy className="h-2.5 w-2.5" />
		</Button>
	);
}
