export type NewsletterResult = {
  status: "success" | "duplicate" | "error";
  message: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// DEV ONLY — in-memory duplicate detection for the frontend demo.
const subscribedEmails = new Set<string>();

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export async function subscribeToNewsletter(
  email: string,
): Promise<NewsletterResult> {
  const normalized = email.trim().toLowerCase();

  if (!isValidEmail(normalized)) {
    return {
      status: "error",
      message: "Please enter a valid email address.",
    };
  }

  // API-ready: replace the simulation below with
  // POST /api/newsletter/subscribe
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (subscribedEmails.has(normalized)) {
    return {
      status: "duplicate",
      message: "This email is already subscribed to the BookHand newsletter.",
    };
  }

  subscribedEmails.add(normalized);

  return {
    status: "success",
    message:
      "You are subscribed. Look out for new arrivals, offers, and reading picks.",
  };
}
