"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

import CustomizeDialog from "./customizeDialog";

export default function ExampleDialog() {
	const [showCustomize, setShowCustomize] = useState(false);

	return (
		<Dialog>
			<DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 font-medium text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
				View notifications
			</DialogTrigger>
			<DialogContent className="w-96 max-w-[calc(100vw-3rem)]">
				<DialogTitle className="-mt-1.5 mb-1 font-medium text-lg">
					Notifications
				</DialogTitle>
				<DialogDescription className="mb-6 text-base text-gray-600">
					You are all caught up. Good job!
				</DialogDescription>
				<div className="flex items-center justify-end gap-4">
					<div className="mr-auto flex">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => setShowCustomize(true)}
							className="text-blue-800 hover:bg-blue-800/5 hover:text-blue-800"
						>
							Customize
						</Button>
						<CustomizeDialog
							open={showCustomize}
							onOpenChange={setShowCustomize}
						/>
					</div>

					<DialogClose>
						<Button variant="outline">Close</Button>
					</DialogClose>
				</div>
			</DialogContent>
		</Dialog>
	);
}
