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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Clock, Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCreateSequence } from "../queries/sequences.queries";
import type { CreateSequence } from "../schemas/sequence.schema";
import { createSequenceSchema } from "../schemas/sequence.schema";

interface SequenceCreateModalProps {
	onSuccess?: () => void;
	trigger?: React.ReactNode;
}

const QUICK_DELAYS = [
	{ label: "5 minutes", value: 5 },
	{ label: "15 minutes", value: 15 },
	{ label: "30 minutes", value: 30 },
	{ label: "1 hour", value: 60 },
	{ label: "2 hours", value: 120 },
	{ label: "4 hours", value: 240 },
	{ label: "8 hours", value: 480 },
	{ label: "12 hours", value: 720 },
	{ label: "24 hours", value: 1440 },
	{ label: "2 days", value: 2880 },
	{ label: "3 days", value: 4320 },
	{ label: "5 days", value: 7200 },
	{ label: "1 week", value: 10080 },
	{ label: "2 weeks", value: 20160 },
];

export function SequenceCreateModal({
	onSuccess,
	trigger,
}: SequenceCreateModalProps) {
	const [open, setOpen] = useState(false);
	const [delayType, setDelayType] = useState<"quick" | "custom">("quick");
	const [customDays, setCustomDays] = useState(0);
	const [customHours, setCustomHours] = useState(0);
	const [customMinutes, setCustomMinutes] = useState(0);

	const createSequence = useCreateSequence();

	const form = useForm<CreateSequence>({
		resolver: zodResolver(createSequenceSchema),
		defaultValues: {
			display_name: "",
			subject: "",
			first_follow_up_delay_minutes: 60,
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

	const formatDelayPreview = (minutes: number) => {
		const days = Math.floor(minutes / 1440);
		const hours = Math.floor((minutes % 1440) / 60);
		const mins = minutes % 60;

		const parts = [];
		if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
		if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
		if (mins > 0) parts.push(`${mins} minute${mins !== 1 ? "s" : ""}`);

		return parts.join(", ") || "0 minutes";
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

						<FormField
							control={form.control}
							name="first_follow_up_delay_minutes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>First Follow-up Delay</FormLabel>
									<FormControl>
										<Tabs
											value={delayType}
											onValueChange={(v) =>
												setDelayType(v as "quick" | "custom")
											}
										>
											<TabsList className="grid w-full grid-cols-2">
												<TabsTrigger value="quick">
													<Clock className="mr-2 h-4 w-4" />
													Quick Select
												</TabsTrigger>
												<TabsTrigger value="custom">
													<Calendar className="mr-2 h-4 w-4" />
													Custom
												</TabsTrigger>
											</TabsList>

											<TabsContent value="quick" className="space-y-3">
												<Select
													value={field.value.toString()}
													onValueChange={(value) =>
														field.onChange(Number.parseInt(value))
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select delay" />
													</SelectTrigger>
													<SelectContent>
														{QUICK_DELAYS.map((delay) => (
															<SelectItem
																key={delay.value}
																value={delay.value.toString()}
															>
																{delay.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</TabsContent>

											<TabsContent value="custom" className="space-y-3">
												<div className="grid grid-cols-3 gap-3">
													<div>
														<label className="font-medium text-sm">Days</label>
														<Input
															type="number"
															min="0"
															max="30"
															value={customDays}
															onChange={(e) => {
																const days =
																	Number.parseInt(e.target.value) || 0;
																setCustomDays(days);
																const totalMinutes =
																	days * 1440 +
																	customHours * 60 +
																	customMinutes;
																form.setValue(
																	"first_follow_up_delay_minutes",
																	totalMinutes,
																);
															}}
														/>
													</div>
													<div>
														<label className="font-medium text-sm">Hours</label>
														<Input
															type="number"
															min="0"
															max="23"
															value={customHours}
															onChange={(e) => {
																const hours =
																	Number.parseInt(e.target.value) || 0;
																setCustomHours(hours);
																const totalMinutes =
																	customDays * 1440 +
																	hours * 60 +
																	customMinutes;
																form.setValue(
																	"first_follow_up_delay_minutes",
																	totalMinutes,
																);
															}}
														/>
													</div>
													<div>
														<label className="font-medium text-sm">
															Minutes
														</label>
														<Input
															type="number"
															min="0"
															max="59"
															value={customMinutes}
															onChange={(e) => {
																const minutes =
																	Number.parseInt(e.target.value) || 0;
																setCustomMinutes(minutes);
																const totalMinutes =
																	customDays * 1440 +
																	customHours * 60 +
																	minutes;
																form.setValue(
																	"first_follow_up_delay_minutes",
																	totalMinutes,
																);
															}}
														/>
													</div>
												</div>
											</TabsContent>
										</Tabs>
									</FormControl>

									<div className="rounded-lg bg-muted/50 px-3 py-2">
										<p className="text-muted-foreground text-sm">
											First message will be sent:{" "}
											<span className="font-medium text-foreground">
												{formatDelayPreview(field.value)}
											</span>{" "}
											after sequence starts
										</p>
									</div>

									<FormDescription>
										How long to wait before sending the first follow-up message
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
