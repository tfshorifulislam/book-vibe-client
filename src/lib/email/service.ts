import "server-only";

import type { EmailOptions, EmailResult } from "./types";

const FROM_EMAIL = process.env.EMAIL_FROM || "BookHand <noreply@bookhand.com>";

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: EmailOptions): Promise<EmailResult> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to,
          subject,
          html,
          text,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("[Email] Resend API error:", data);
        return {
          success: false,
          error: data.message || "Failed to deliver email",
        };
      }

      return { success: true, messageId: data.id };
    } catch (err) {
      console.error("[Email] Delivery exception:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Network error",
      };
    }
  }

  // Development / sandbox fallback: log cleanly without leaking secrets
  if (process.env.NODE_ENV !== "production") {
    console.info(`[Email Simulated] To: ${to} | Subject: "${subject}"`);
  }

  return { success: true, messageId: "dev-simulated-id" };
}
