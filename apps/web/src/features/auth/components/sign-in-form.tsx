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
import { AnimatePresence, motion as m } from "framer-motion";
import { toast } from "sonner";
import * as z from "zod";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

interface SignInFormProps {
  redirectTo?: string;
}

export function SignInForm({ redirectTo = "/teacher" }: SignInFormProps) {
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
    "email"
  );
  const router = useRouter();
  
  console.log("SignInForm mounted with redirectTo:", redirectTo);

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
      if (document.visibilityState === 'visible') {
        checkForCancellation();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPasskeyLoading, passkeyResolved]);

  const emailForm = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      setEmailError(""); // Clear any previous errors

      // TEMPORARY: Bypass authentication - accept any email
      if (submissionType === "passkey") {
        // Simulate passkey loading
        setIsPasskeyLoading(true);
        console.log("Passkey: Navigating to:", redirectTo || "/teacher");
        setTimeout(() => {
          router.push(redirectTo || "/teacher");
          router.refresh();
          setIsPasskeyLoading(false);
        }, 1000);
        return;
      }

      // TEMPORARY: Skip OTP and go directly to dashboard
      setIsLoading(true);
      setEmail(value.email);
      
      console.log("Redirect to:", redirectTo || "/teacher");
      
      // Simulate authentication delay
      setTimeout(() => {
        console.log("Navigating now to:", redirectTo || "/teacher");
        router.push(redirectTo || "/teacher");
        router.refresh(); // Force a refresh
        setIsLoading(false);
      }, 1500);

      /* ORIGINAL AUTH CODE - COMMENTED FOR TEMPORARY BYPASS
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
                setTimeout(() => {
                  router.push(redirectTo);
                }, 0);
              },
              onError: (error) => {
                setPasskeyResolved(true); // Mark as resolved
                toast.error(
                  error.error.message || "Passkey sign-in failed"
                );
                setIsPasskeyLoading(false); // Only stop loading on error
              },
            }
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
                  error.error.message || "Failed to send verification code"
                );
              }
            },
          }
        );
      } finally {
        setIsLoading(false);
      }
      */
    },
    validators: {
      onSubmit: emailSchema,
    },
  });

  const handleVerifyOtp = async () => {
    // TEMPORARY: Accept any 6-digit code and redirect
    if (!otp || otp.length !== 6) {
      return;
    }

    setIsLoading(true);
    
    // Simulate verification delay
    setTimeout(() => {
      router.push(redirectTo);
      setIsLoading(false);
    }, 1000);

    /* ORIGINAL AUTH CODE - COMMENTED FOR TEMPORARY BYPASS
    try {
      await authClient.signIn.emailOtp(
        {
          email: email,
          otp: otp,
        },
        {
          onSuccess: () => {
            setTimeout(() => {
              router.push(redirectTo);
            }, 0);
          },
          onError: (error) => {
            toast.error(error.error.message || "Invalid code");
            setIsLoading(false); // Only stop loading on error
          },
        }
      );
    } catch (error: any) {
      toast.error(error?.message || "Failed to verify code");
      setIsLoading(false); // Only stop loading on error
    }
    */
  };

  const handleResendCode = async () => {
    // TEMPORARY: Just show a success message
    setIsLoading(true);
    setTimeout(() => {
      setResendDisabled(true);
      setCountdown(30);
      setIsLoading(false);
    }, 500);

    /* ORIGINAL AUTH CODE - COMMENTED FOR TEMPORARY BYPASS
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
    */
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

  const commonButtonClassName =
    "inline-flex align-top items-center justify-center whitespace-nowrap shrink-0 font-semibold select-none relative shadow-sm min-w-8 h-[44px] text-[14px] w-full px-4 py-0 rounded-lg disabled:opacity-60 transition-all duration-200";

  return (
    <div className="m-0 flex min-h-screen flex-auto shrink-0 flex-col border-0 bg-gradient-to-br from-background via-background to-accent/5 p-0 align-baseline transition-colors duration-300">
      <div className="flex flex-1 justify-center items-center flex-col">
        <div
          className="mx-auto flex flex-col justify-center items-center border-0 p-0 align-baseline [-webkit-box-align:center]"
        >
          <div className="w-[440px] bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl">
            {/* Logo Section - Redesigned for extended logo */}
            <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 rounded-t-2xl border-b border-border/30 px-10 py-8">
              <div className="flex justify-center">
                <Logo width={180} height={60} className="w-auto h-auto" />
              </div>
            </div>
            
            {/* Content Section */}
            <div className="px-10 pb-10 pt-8">
              

              {/* Welcome Section */}
              <div className="mb-8 space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary/30" />
                  <h1 className="text-center font-bold text-foreground text-[32px] leading-none tracking-tight">
                    Bienvenue
                  </h1>
                  <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary/30" />
                </div>
                
                <div className="space-y-2">
                  <p className="text-center text-[17px] font-medium text-foreground/90 leading-relaxed">
                  Portal for teachers and students.
                  </p>
                </div>
                
                {/* Small decorative element */}
                <div className="flex justify-center pt-2">
                  <div className="flex gap-1">
                    <div className="h-1 w-1 rounded-full bg-primary/40" />
                    <div className="h-1 w-1 rounded-full bg-primary/60" />
                    <div className="h-1 w-1 rounded-full bg-primary/40" />
                  </div>
                </div>
              </div>

            <AnimatePresence mode="wait" initial={false}>
              {step === "email" && (
                <m.div
                  key="email"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="space-y-4"
                >
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSubmissionType("email");
                      void emailForm.handleSubmit();
                    }}
                    className="space-y-4"
                  >
                    <emailForm.Field name="email">
                      {(field) => (
                        <div className="space-y-2">
                          <Label
                            htmlFor={field.name}
                            className="font-medium text-foreground text-[14px] block"
                          >
                            Email Address
                          </Label>
                          <input
                            id={field.name}
                            name={field.name}
                            type="email"
                            // biome-ignore lint/a11y/noAutofocus: <fuck accessibility>
                            autoFocus={true}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="name@example.com"
                            autoComplete="username webauthn"
                            className={`m-0 h-[44px] w-full appearance-none rounded-lg border px-4 py-2 text-foreground text-[14px] transition-all duration-200 bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 ${
                              field.state.meta.errors.length > 0 || emailError
                                ? "border-destructive hover:border-destructive focus:border-destructive focus:ring-destructive/20"
                                : "border-input hover:border-muted-foreground/50"
                            }`}
                          />
                          {field.state.meta.errors.map((error) => (
                            <p
                              key={error?.message}
                              className="text-red-500 text-sm"
                            >
                              {error?.message}
                            </p>
                          ))}
                          {emailError && (
                            <p className="text-red-500 text-sm">{emailError}</p>
                          )}
                        </div>
                      )}
                    </emailForm.Field>

                    <emailForm.Subscribe>
                      {(state) => (
                        <div className="">
                          <Button
                            type="submit"
                            className={`${commonButtonClassName} bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-md hover:shadow-lg`}
                            disabled={
                              (state.isSubmitting &&
                                submissionType === "email") ||
                              isLoading ||
                              isPasskeyLoading
                            }
                          >
                            {(state.isSubmitting &&
                              submissionType === "email") ||
                            isLoading ? (
                              <Loader className="size-4 animate-spin" />
                            ) : (
                              "Continue with Email"
                            )}
                          </Button>
                          <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-card px-3 text-muted-foreground text-[12px] font-medium">
                                Or continue with
                              </span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={handlePasskeySignIn}
                            disabled={
                              isPasskeyLoading ||
                              (state.isSubmitting &&
                                submissionType === "passkey")
                            }
                            className={`${commonButtonClassName} flex items-center gap-2 bg-background hover:bg-muted border border-input text-foreground hover:border-muted-foreground/50`}
                          >
                            {isPasskeyLoading ||
                            (state.isSubmitting &&
                              submissionType === "passkey") ? (
                              <Loader className="size-4 animate-spin" />
                            ) : (
                              <>
                                <Key className="size-4" />
                                <span>Sign in with Passkey</span>
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </emailForm.Subscribe>
                  </form>
                </m.div>
              )}

              {step === "otp" && (
                <m.div
                  key="otp"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <p className="text-center text-foreground text-[14px]">
                      We sent a verification code to
                    </p>
                    <p className="text-center text-primary font-semibold text-[15px]">
                      {email}
                    </p>
                    <p className="text-center text-muted-foreground text-[13px]">
                      Please check your email and spam folder
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={setOtp}
                        autoFocus
                        onComplete={handleVerifyOtp}
                      >
                        <InputOTPGroup className="">
                          <InputOTPSlot
                            index={0}
                            className="border-input text-lg bg-background text-foreground h-12 w-12 rounded-lg"
                          />
                          <InputOTPSlot
                            index={1}
                            className="border-input text-lg bg-background text-foreground h-12 w-12 rounded-lg"
                          />
                          <InputOTPSlot
                            index={2}
                            className="border-input text-lg bg-background text-foreground h-12 w-12 rounded-lg"
                          />
                          <InputOTPSlot
                            index={3}
                            className="border-input text-lg bg-background text-foreground h-12 w-12 rounded-lg"
                          />
                          <InputOTPSlot
                            index={4}
                            className="border-input text-lg bg-background text-foreground h-12 w-12 rounded-lg"
                          />
                          <InputOTPSlot
                            index={5}
                            className="border-input text-lg bg-background text-foreground h-12 w-12 rounded-lg"
                          />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <Button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={isLoading || otp.length !== 6}
                      className={`${commonButtonClassName} bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-md hover:shadow-lg`}
                    >
                      {isLoading ? (
                        <Loader className="size-4 animate-spin" />
                      ) : (
                        "Verify Code"
                      )}
                    </Button>

                    <Button
                      type="button"
                      disabled={resendDisabled || isLoading}
                      onClick={handleResendCode}
                      className="mx-auto mt-4 block text-muted-foreground text-[13px] no-underline transition-colors duration-200 hover:text-primary hover:no-underline"
                      variant="link"
                    >
                      {resendDisabled
                        ? `Resend code in ${countdown}s`
                        : "Didn't receive it? Resend code"}
                    </Button>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
