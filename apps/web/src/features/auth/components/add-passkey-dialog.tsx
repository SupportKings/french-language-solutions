"use client";

import { useState } from "react";

import { authClient } from "@/lib/auth-client";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { useQueryClient } from "@tanstack/react-query";
import { Fingerprint, Loader, QrCode } from "lucide-react";
import { toast } from "sonner";

interface AddPasskeyDialogProps {
	children?: React.ReactNode;
	passkeyCount?: number;
}

export function AddPasskeyDialog({
	children,
	passkeyCount = 0,
}: AddPasskeyDialogProps) {
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [passkeyName, setPasskeyName] = useState("");
	const [authenticatorType, setAuthenticatorType] = useState<
		"platform" | "cross-platform"
	>("platform");
	const [isLoading, setIsLoading] = useState(false);

	const handleAddPasskey = async () => {
		if (!passkeyName.trim()) {
			toast.error("Please enter a name for your passkey");
			return;
		}

		setIsLoading(true);

		await authClient.passkey.addPasskey(
			{
				authenticatorAttachment: authenticatorType,
				name: passkeyName,
			},
			{
				onSuccess: (data) => {
					console.log("Passkey added successfully:", data);
					toast.success("Passkey added successfully");
					queryClient.invalidateQueries({ queryKey: ["passkeys"] });
					setOpen(false);
					setPasskeyName("");
					setAuthenticatorType("platform");
					setIsLoading(false);
				},
				onError: (error) => {
					console.error("Error adding passkey:", error);
					console.error("Error details:", {
						message: error.error?.message,
						code: error.error?.code,
						fullError: error,
					});

					// Provide more specific error messages
					let errorMessage = "Failed to add passkey";

					if (error.error?.message?.includes("already registered")) {
						errorMessage = "This device is already registered as a passkey";
					} else if (
						error.error?.message?.includes("cancelled") ||
						error.error?.message?.includes("canceled")
					) {
						errorMessage = "Passkey registration was cancelled";
					} else if (error.error?.message?.includes("not supported")) {
						errorMessage = "Passkeys are not supported on this device";
					} else if (error.error?.message) {
						errorMessage = error.error.message;
					}

					toast.error(errorMessage);
					setIsLoading(false);
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{children ? (
				<DialogTrigger>{children}</DialogTrigger>
			) : (
				<DialogTrigger>
					<Button
						variant="outline"
						size="sm"
						className="shrink-0"
						disabled={passkeyCount >= 1}
					>
						{passkeyCount >= 1 ? "Max 1 Passkey" : "Add Passkey"}
					</Button>
				</DialogTrigger>
			)}
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add a new passkey</DialogTitle>
					<DialogDescription>
						Create a secure passkey for passwordless authentication
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="name">Passkey name</Label>
						<Input
							id="name"
							value={passkeyName}
							onChange={(e) => setPasskeyName(e.target.value)}
							placeholder="e.g., My MacBook"
							disabled={isLoading}
						/>
					</div>
					<div className="space-y-4">
						<Label>Authentication type</Label>
						<div className="space-y-3">
							<button
								type="button"
								className={`flex w-full cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
									authenticatorType === "platform"
										? "border-[lch(50_80_141.95)] bg-[lch(50_80_141.95)]/5"
										: "border-neutral-300 dark:border-[#2c2e33]"
								} ${isLoading ? "pointer-events-none opacity-60" : ""}`}
								onClick={() => !isLoading && setAuthenticatorType("platform")}
								disabled={isLoading}
							>
								<div className="flex items-center gap-3">
									<Fingerprint className="h-5 w-5" />
									<div>
										<p className="font-medium text-sm">This device</p>
										<p className="text-[lch(39.286_1_282.863)] text-xs dark:text-[lch(63.975_7_271.985)]">
											Use biometrics or device PIN
										</p>
									</div>
								</div>
								<Switch
									checked={authenticatorType === "platform"}
									onCheckedChange={(checked) =>
										checked && !isLoading && setAuthenticatorType("platform")
									}
									disabled={isLoading}
								/>
							</button>
							<button
								type="button"
								className={`flex w-full cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
									authenticatorType === "cross-platform"
										? "border-[lch(50_80_141.95)] bg-[lch(50_80_141.95)]/5"
										: "border-neutral-300 dark:border-[#2c2e33]"
								} ${isLoading ? "pointer-events-none opacity-60" : ""}`}
								onClick={() =>
									!isLoading && setAuthenticatorType("cross-platform")
								}
								disabled={isLoading}
							>
								<div className="flex items-center gap-3">
									<QrCode className="h-5 w-5" />
									<div>
										<p className="font-medium text-sm">Cross-platform</p>
										<p className="text-[lch(39.286_1_282.863)] text-xs dark:text-[lch(63.975_7_271.985)]">
											Use external device or security key
										</p>
									</div>
								</div>
								<Switch
									checked={authenticatorType === "cross-platform"}
									onCheckedChange={(checked) =>
										checked &&
										!isLoading &&
										setAuthenticatorType("cross-platform")
									}
									disabled={isLoading}
								/>
							</button>
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button
						onClick={handleAddPasskey}
						disabled={isLoading || !passkeyName.trim()}
					>
						{isLoading ? (
							<>
								<Loader className="mr-2 h-4 w-4 animate-spin" />
								Creating...
							</>
						) : (
							"Create Passkey"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
