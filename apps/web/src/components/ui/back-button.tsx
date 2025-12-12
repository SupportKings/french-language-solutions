"use client";

import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";
import { Button } from "./button";

export function BackButton() {
	const router = useRouter();

	return (
		<Button
			variant="ghost"
			size="sm"
			aria-label="Go back"
			type="button"
			onClick={() => router.back()}
			className="h-8 px-2"
		>
			<ArrowLeft className="h-4 w-4" />
		</Button>
	);
}
