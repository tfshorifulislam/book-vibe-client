import "server-only";

import type { EmailOptions, EmailResult } from "./types";

export function resolveSenderEmail(): string {
  const configured = process.env.EMAIL_FROM?.trim();
  const resendTestSender = "BookHand <onboarding@resend.dev>";

  if (!configured) {
    return resendTestSender;
  }

  // Detect public webmail domains that Resend strictly disallows
  const isPublicWebmail = /@(gmail|yahoo|hotmail|outlook|aol)\.com/i.test(
    configured,
  );
  if (isPublicWebmail) {
    if (process.env.NODE_ENV !== "production") {
      // In development/test, seamlessly use Resend's official sandbox sender
      return resendTestSender;
    }
    console.warn(
      "[Email] Warning: Resend disallows public webmail domains in production. Please configure a verified domain in EMAIL_FROM.",
    );
  }

  return configured;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: EmailOptions): Promise<EmailResult> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const from = resolveSenderEmail();
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to,
          subject,
          html,
          text,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        const errorMsg = data?.message || "Failed to deliver email";
        console.error(`[Email] Resend API error: ${errorMsg}`);
        return {
          success: false,
          error: errorMsg,
        };
      }

      return { success: true, messageId: data.id };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Network error";
      console.error(`[Email] Delivery exception: ${errorMsg}`);
      return {
        success: false,
        error: errorMsg,
      };
    }
  }

  // Development fallback when no API key is provided
  if (process.env.NODE_ENV !== "production") {
    console.info(`[Email Simulated] To: ${to} | Subject: "${subject}"`);
  }

  return { success: true, messageId: "dev-simulated-id" };
}
