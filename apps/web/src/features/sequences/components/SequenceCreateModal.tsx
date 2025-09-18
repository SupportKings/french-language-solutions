"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCreateSequence } from "../queries/sequences.queries";
import type { CreateSequence } from "../schemas/sequence.schema";
import { createSequenceSchema } from "../schemas/sequence.schema";

interface SequenceCreateModalProps {
	onSuccess?: () => void;
	trigger?: React.ReactNode;
}

export function SequenceCreateModal({
	onSuccess,
	trigger,
}: SequenceCreateModalProps) {
	const [open, setOpen] = useState(false);

	const createSequence = useCreateSequence();

	const form = useForm<CreateSequence>({
		resolver: zodResolver(createSequenceSchema),
		defaultValues: {
			display_name: "",
			subject: "",
		},
	});

	const handleSubmit = async (data: CreateSequence) => {
		try {
			await createSequence.mutateAsync(data);
			toast.success("Sequence created successfully");
			form.reset();
			setOpen(false);
			onSuccess?.();
		} catch (error) {
			toast.error("Failed to create sequence");
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{trigger ? (
				<DialogTrigger>{trigger}</DialogTrigger>
			) : (
				<DialogTrigger className="group relative inline-flex h-9 shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-3 font-medium text-primary-foreground text-sm ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
					<Plus className="mr-1.5 h-4 w-4" />
					New Sequence
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Create New Sequence</DialogTitle>
					<DialogDescription>
						Create a new follow-up sequence template that can be used for
						automated communications
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-6"
					>
						<FormField
							control={form.control}
							name="display_name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Sequence Name</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g., Welcome Series, Post-Purchase Follow-up"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										A descriptive name to identify this sequence
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="subject"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email Subject</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g., Thank you for your enrollment!"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										The subject line for emails in this sequence
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={createSequence.isPending}>
								{createSequence.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Creating...
									</>
								) : (
									"Create Sequence"
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
