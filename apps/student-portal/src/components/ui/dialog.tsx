import type * as React from "react";

import { cn } from "@/lib/utils";

import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";
import { XIcon } from "lucide-react";

function Dialog({ ...props }: React.ComponentProps<typeof BaseDialog.Root>) {
	return <BaseDialog.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
	...props
}: React.ComponentProps<typeof BaseDialog.Trigger>) {
	return <BaseDialog.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
	...props
}: React.ComponentProps<typeof BaseDialog.Portal>) {
	return <BaseDialog.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
	...props
}: React.ComponentProps<typeof BaseDialog.Close>) {
	return <BaseDialog.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
	className,
	...props
}: React.ComponentProps<typeof BaseDialog.Backdrop>) {
	return (
		<BaseDialog.Backdrop
			data-slot="dialog-overlay"
			className={cn(
				"fixed inset-0 z-50 bg-black/20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:bg-black/70",
				className,
			)}
			{...props}
		/>
	);
}

function DialogContent({
	className,
	children,
	showCloseButton = true,
	nested = false,
	...props
}: React.ComponentProps<typeof BaseDialog.Popup> & {
	showCloseButton?: boolean;
	nested?: boolean;
}) {
	if (nested) {
		// For nested dialogs, don't use Portal or Overlay - render directly with nested positioning
		return (
			<BaseDialog.Popup
				data-slot="dialog-content"
				className={cn(
					"-mt-8 -translate-x-1/2 -translate-y-1/2 fixed top-[calc(50%+1.25rem*var(--nested-dialogs))] left-1/2 z-[60] grid max-h-[90vh] w-full max-w-[calc(100%-2rem)] scale-[calc(1-0.1*var(--nested-dialogs))] gap-4 overflow-y-auto rounded-lg border bg-background p-6 shadow-lg transition-all duration-150 data-[ending-style]:scale-90 data-[starting-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[nested-dialog-open]:after:absolute data-[nested-dialog-open]:after:inset-0 data-[nested-dialog-open]:after:rounded-[inherit] data-[nested-dialog-open]:after:bg-black/5 sm:max-w-lg",
					className,
				)}
				{...props}
			>
				{children}
				{showCloseButton && (
					<BaseDialog.Close
						data-slot="dialog-close"
						className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0"
					>
						<XIcon />
						<span className="sr-only">Close</span>
					</BaseDialog.Close>
				)}
			</BaseDialog.Popup>
		);
	}

	return (
		<DialogPortal data-slot="dialog-portal">
			<DialogOverlay />
			<BaseDialog.Popup
				data-slot="dialog-content"
				className={cn(
					"-mt-8 -translate-x-1/2 -translate-y-1/2 fixed top-[calc(50%+1.25rem*var(--nested-dialogs))] left-1/2 z-50 grid max-h-[90vh] w-full max-w-[calc(100%-2rem)] scale-[calc(1-0.1*var(--nested-dialogs))] gap-4 overflow-y-auto rounded-lg border bg-background p-6 shadow-lg transition-all duration-150 data-[ending-style]:scale-90 data-[starting-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[nested-dialog-open]:after:absolute data-[nested-dialog-open]:after:inset-0 data-[nested-dialog-open]:after:rounded-[inherit] data-[nested-dialog-open]:after:bg-black/5 sm:max-w-lg",
					className,
				)}
				{...props}
			>
				{children}
				{showCloseButton && (
					<BaseDialog.Close
						data-slot="dialog-close"
						className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0"
					>
						<XIcon />
						<span className="sr-only">Close</span>
					</BaseDialog.Close>
				)}
			</BaseDialog.Popup>
		</DialogPortal>
	);
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-header"
			className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
			{...props}
		/>
	);
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-footer"
			className={cn(
				"flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
				className,
			)}
			{...props}
		/>
	);
}

function DialogTitle({
	className,
	...props
}: React.ComponentProps<typeof BaseDialog.Title>) {
	return (
		<BaseDialog.Title
			data-slot="dialog-title"
			className={cn("font-semibold text-lg leading-none", className)}
			{...props}
		/>
	);
}

function DialogDescription({
	className,
	...props
}: React.ComponentProps<typeof BaseDialog.Description>) {
	return (
		<BaseDialog.Description
			data-slot="dialog-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
