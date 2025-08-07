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
}

// THIS IS THE ORIGINAL SIGN-IN FORM WITH REAL AUTHENTICATION
// KEPT FOR RESTORATION AFTER TEMPORARY BYPASS IS NO LONGER NEEDED

export function SignInForm({ redirectTo = "/" }: SignInFormProps) {
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
        }
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

  // Rest of the component remains the same...
}