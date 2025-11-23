"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";

import { siteConfig } from "@/siteConfig";

import { useForm } from "@tanstack/react-form";
import { Key, Loader } from "lucide-react";
import { AnimatePresence, motion as m } from "motion/react";
import { toast } from "sonner";
import * as z from "zod";

const emailSchema = z.object({
	email: z.string().email("Invalid email address"),
});

interface SignInFormProps {
	redirectTo?: string;
	error?: string;
}

const errorMessages: Record<string, string> = {
	unauthorized:
		"You don't have permission to access the admin portal. If you're a student, please use the Student Portal.",
};

export function SignInForm({ redirectTo = "/", error }: SignInFormProps) {
	const [step, setStep] = useState<"email" | "otp">("email");
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
	const [passkeyResolved, setPasskeyResolved] = useState(false);

	const [resendDisabled, setResendDisabled] = useState(false);
	const [countdown, setCountdown] = useState(0);
	const [emailError, setEmailError] = useState<string | React.ReactElement>("");
	const [submissionType, setSubmissionType] = useState<"email" | "passkey">(
		"email",
	);
	const router = useRouter();

	// Handle passkey cancellation detection
	useEffect(() => {
		if (!isPasskeyLoading) return;

		let timeoutId: NodeJS.Timeout;

		const checkForCancellation = () => {
			// Clear any existing timeout
			if (timeoutId) clearTimeout(timeoutId);

			// Set a new timeout - longer delay to avoid false positives
			timeoutId = setTimeout(() => {
				// Only show cancellation if we're still loading AND haven't resolved
				if (isPasskeyLoading && !passkeyResolved) {
					setIsPasskeyLoading(false);
					toast.error("Passkey authentication was cancelled");
				}
			}, 1000); // 1 second delay to ensure it's actually cancelled
		};

		const handleFocus = () => {
			checkForCancellation();
		};

		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				checkForCancellation();
			}
		};

		window.addEventListener("focus", handleFocus);
		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			if (timeoutId) clearTimeout(timeoutId);
			window.removeEventListener("focus", handleFocus);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [isPasskeyLoading, passkeyResolved]);

	const emailForm = useForm({
		defaultValues: {
			email: "",
		},
		onSubmit: async ({ value }) => {
			setEmailError(""); // Clear any previous errors

			if (submissionType === "passkey") {
				// Handle passkey authentication
				setIsPasskeyLoading(true);
				setPasskeyResolved(false); // Reset resolution state
				try {
					await authClient.signIn.passkey(
						{
							email: value.email,
						},
						{
							onSuccess: () => {
								setPasskeyResolved(true); // Mark as resolved
								// We wrap our navigate in a setTimeout 0. This forces the code to run on the next tick,
								// which protects us against some edge cases where you are signed in but the cookie isn't set yet
								// causing you to bounce between routes over and over.
								setTimeout(() => {
									router.push(redirectTo);
								}, 0);
							},
							onError: (error) => {
								setPasskeyResolved(true); // Mark as resolved
								toast.error(error.error.message || "Passkey sign-in failed");
								setIsPasskeyLoading(false); // Only stop loading on error
							},
						},
					);
				} catch (error: any) {
					console.error("Passkey sign-in error:", error);
					setPasskeyResolved(true); // Mark as resolved
					toast.error("Passkey sign-in failed. Please try again.");
					setIsPasskeyLoading(false);
				}
				return;
			}

			// Handle email OTP authentication
			setIsLoading(true);
			try {
				await authClient.emailOtp.sendVerificationOtp(
					{
						email: value.email,
						type: "sign-in",
					},
					{
						onSuccess: () => {
							setEmail(value.email);
							setStep("otp");
							setResendDisabled(true);
							setCountdown(30);
						},
						onError: (error) => {
							// Handle the case where user doesn't exist (Better Auth beta throws USER_NOT_FOUND)
							if (error.error.code === "USER_NOT_FOUND") {
								setEmail(value.email);
								setStep("otp");
								setResendDisabled(true);
								setCountdown(30);
							} else {
								setEmailError(
									error.error.message || "Failed to send verification code",
								);
							}
						},
					},
				);
			} finally {
				setIsLoading(false);
			}
		},
		validators: {
			onSubmit: emailSchema,
		},
	});

	const handleVerifyOtp = async () => {
		if (!otp || otp.length !== 6) {
			return;
		}

		setIsLoading(true);
		try {
			await authClient.signIn.emailOtp(
				{
					email: email,
					otp: otp,
				},
				{
					onSuccess: () => {
						// We wrap our navigate in a setTimeout 0. This forces the code to run on the next tick,
						// which protects us against some edge cases where you are signed in but the cookie isn't set yet
						// causing you to bounce between routes over and over.
						// https://x.com/IzakFilmalter/status/1929865024366948690
						setTimeout(() => {
							router.push(redirectTo);
						}, 0);
						// Don't set isLoading to false here - keep the loading state during redirect
						/*             toast.success("Sign in successful");
						 */
					},
					onError: (error) => {
						toast.error(error.error.message || "Invalid code");
						setIsLoading(false); // Only stop loading on error
					},
				},
			);
		} catch (error: any) {
			toast.error(error?.message || "Failed to verify code");
			setIsLoading(false); // Only stop loading on error
		}
	};

	const handleResendCode = async () => {
		setIsLoading(true);
		try {
			await authClient.emailOtp.sendVerificationOtp({
				email: email,
				type: "sign-in",
			});
			setResendDisabled(true);
			setCountdown(30);
		} catch (error: any) {
			toast.error(error?.message || "Failed to resend code");
		} finally {
			setIsLoading(false);
		}
	};

	const handlePasskeySignIn = () => {
		setSubmissionType("passkey");
		void emailForm.handleSubmit();
	};

	useEffect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timer);
		}
		setResendDisabled(false);
	}, [countdown]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<Logo className="mx-auto h-12 w-auto" />
					<h2 className="mt-6 font-bold text-3xl text-foreground tracking-tight">
						Sign in to {siteConfig.name}
					</h2>
					<p className="mt-2 text-muted-foreground text-sm">
						Enter your email to receive a sign-in code
					</p>
				</div>

				{error && errorMessages[error] && (
					<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive text-sm">
						{errorMessages[error]}
					</div>
				)}

				<AnimatePresence mode="wait">
					{step === "email" ? (
						<m.div
							key="email"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							transition={{ duration: 0.2 }}
							className="space-y-6"
						>
							<form
								onSubmit={(e) => {
									e.preventDefault();
									setSubmissionType("email");
									void emailForm.handleSubmit();
								}}
							>
								<emailForm.Field name="email">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Email address</Label>
											<input
												id={field.name}
												type="email"
												autoComplete="email"
												required
												className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
												placeholder="name@example.com"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
											/>
											{emailError && (
												<p className="text-destructive text-sm">{emailError}</p>
											)}
										</div>
									)}
								</emailForm.Field>

								<div className="mt-6 space-y-3">
									<Button
										type="submit"
										className="w-full"
										disabled={isLoading || isPasskeyLoading}
									>
										{isLoading ? (
											<>
												<Loader className="mr-2 h-4 w-4 animate-spin" />
												Sending code...
											</>
										) : (
											"Continue with Email"
										)}
									</Button>

									<div className="relative">
										<div className="absolute inset-0 flex items-center">
											<span className="w-full border-border border-t" />
										</div>
										<div className="relative flex justify-center text-xs uppercase">
											<span className="bg-background px-2 text-muted-foreground">
												Or
											</span>
										</div>
									</div>

									<Button
										type="button"
										variant="outline"
										className="w-full"
										onClick={handlePasskeySignIn}
										disabled={isLoading || isPasskeyLoading}
									>
										{isPasskeyLoading ? (
											<>
												<Loader className="mr-2 h-4 w-4 animate-spin" />
												Authenticating...
											</>
										) : (
											<>
												<Key className="mr-2 h-4 w-4" />
												Sign in with Passkey
											</>
										)}
									</Button>
								</div>
							</form>
						</m.div>
					) : (
						<m.div
							key="otp"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.2 }}
							className="space-y-6"
						>
							<div>
								<Label>Verification Code</Label>
								<p className="mt-1 text-muted-foreground text-sm">
									We've sent a 6-digit code to {email}
								</p>
							</div>

							<div className="flex justify-center">
								<InputOTP
									maxLength={6}
									value={otp}
									onChange={(value) => setOtp(value)}
									onComplete={handleVerifyOtp}
								>
									<InputOTPGroup>
										<InputOTPSlot index={0} />
										<InputOTPSlot index={1} />
										<InputOTPSlot index={2} />
										<InputOTPSlot index={3} />
										<InputOTPSlot index={4} />
										<InputOTPSlot index={5} />
									</InputOTPGroup>
								</InputOTP>
							</div>

							<div className="space-y-3">
								<Button
									onClick={handleVerifyOtp}
									className="w-full"
									disabled={isLoading || otp.length !== 6}
								>
									{isLoading ? (
										<>
											<Loader className="mr-2 h-4 w-4 animate-spin" />
											Verifying...
										</>
									) : (
										"Verify Code"
									)}
								</Button>

								<div className="flex items-center justify-between text-sm">
									<button
										type="button"
										onClick={() => {
											setStep("email");
											setOtp("");
										}}
										className="text-primary hover:underline"
									>
										Use a different email
									</button>
									<button
										type="button"
										onClick={handleResendCode}
										disabled={resendDisabled || isLoading}
										className={`${
											resendDisabled
												? "cursor-not-allowed text-muted-foreground"
												: "text-primary hover:underline"
										}`}
									>
										{resendDisabled ? `Resend in ${countdown}s` : "Resend code"}
									</button>
								</div>
							</div>
						</m.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
