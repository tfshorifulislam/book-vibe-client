export type NewsletterResult = {
  status: "success" | "duplicate" | "error";
  message: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

  try {
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalized }),
    });

    const data = (await res.json()) as {
      success?: boolean;
      message?: string;
      isDuplicate?: boolean;
    };

    if (!res.ok) {
      return {
        status: "error",
        message:
          data.message ||
          "Unable to subscribe to newsletter. Please try again.",
      };
    }

    if (data.isDuplicate) {
      return {
        status: "duplicate",
        message:
          data.message ||
          "This email is already subscribed to the BookHand newsletter.",
      };
    }

    return {
      status: "success",
      message:
        data.message ||
        "You are subscribed. Look out for new arrivals, offers, and reading picks.",
    };
  } catch {
    return {
      status: "error",
      message: "Network error. Please check your connection and try again.",
    };
  }
}
