"use server";

import { siteConfig } from "@/siteConfig";

import { OTPEmail } from "@workspace/emails/emails/otp";
import { Resend } from "resend";
import { z } from "zod";

const OTPInput = z.object({
	email: z.string().email(),
	otp: z.string(),
	type: z.enum(["sign-in", "email-verification", "forget-password"]).optional(),
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTP(data: z.infer<typeof OTPInput>) {
	try {
		// Validate input
		const validatedData = OTPInput.parse(data);

		const { error } = await resend.emails.send({
			from: "French Language Solutions <onboarding@resend.dev>",
			to: [validatedData.email],
			subject:
				validatedData.type === "email-verification"
					? "Verify your email address"
					: `Your sign-in code ${validatedData.otp}`,
			react: OTPEmail({
				otp: validatedData.otp,
				companyName: siteConfig.name,
			}),
		});

		if (error) {
			console.error("Error sending email:", error);
			throw new Error("Failed to send email");
		}

		return { success: true, message: "OTP sent successfully" };
	} catch (error) {
		console.error("Error sending OTP email:", error);
		throw new Error("Failed to send OTP email");
	}
}
