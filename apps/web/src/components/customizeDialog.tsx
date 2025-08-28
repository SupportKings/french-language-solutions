import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";

interface CustomizeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function CustomizeDialog({
	open,
	onOpenChange,
}: CustomizeDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent nested className="w-96 max-w-[calc(100vw-3rem)]">
				<DialogTitle className="-mt-1.5 mb-1 font-medium text-lg">
					Customize notification
				</DialogTitle>
				<DialogDescription className="mb-6 text-base text-gray-600">
					Review your settings here.
				</DialogDescription>
				<div className="flex items-center justify-end gap-4">
					<DialogClose>
						<Button variant="outline">Close</Button>
					</DialogClose>
				</div>
			</DialogContent>
		</Dialog>
	);
}
