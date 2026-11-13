"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, CircleCheck, LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  details?: unknown;
};

async function postJson<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await response.json()) as ApiResponse<T>;
}

function fieldClass() {
  return "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none";
}

function Alert({
  kind,
  children,
}: {
  kind: "error" | "success" | "info";
  children: ReactNode;
}) {
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm",
        kind === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : kind === "success"
            ? "border-success/30 bg-success/10 text-success"
            : "border-border bg-muted text-muted-foreground",
      )}
    >
      {kind === "success" ? (
        <CircleCheck className="mt-0.5 size-4 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
      )}
      <div>{children}</div>
    </div>
  );
}

function SubmitButton({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await postJson<{ redirectTo: string }>("/api/auth/login", {
      email,
      password,
    });
    if (!result.success || !result.data) {
      setError(result.message ?? "Unable to sign in.");
      setPending(false);
      return;
    }
    const destination = next && next.startsWith("/") ? next : result.data.redirectTo;
    router.push(destination);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <Alert kind="error">{error}</Alert> : null}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={fieldClass()}
          placeholder="you@example.com"
        />
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={fieldClass()}
          placeholder="Your password"
        />
      </div>
      <SubmitButton pending={pending}>{pending ? "Signing in..." : "Sign in"}</SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        New to BookHand?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const defaultRole = params.get("role") === "seller" ? "seller" : "buyer";
  const [role, setRole] = useState<"buyer" | "seller">(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shopName, setShopName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setPending(true);
    setError(null);
    const result = await postJson<{ user: { role: string } }>("/api/auth/register", {
      name,
      email,
      phone,
      password,
      role,
      shopName: role === "seller" ? shopName : undefined,
    });
    if (!result.success || !result.data) {
      setError(result.message ?? "Unable to create your account.");
      setPending(false);
      return;
    }
    router.push(role === "seller" ? "/seller/dashboard" : "/buyer/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <Alert kind="error">{error}</Alert> : null}
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
        {(["buyer", "seller"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setRole(option)}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium capitalize transition-colors",
              role === option
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option === "buyer" ? "Buy books" : "Sell books"}
          </button>
        ))}
      </div>
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          Full name
        </label>
        <input
          id="name"
          required
          minLength={2}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={fieldClass()}
          placeholder="Your full name"
        />
      </div>
      <div>
        <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={fieldClass()}
          placeholder="you@example.com"
        />
      </div>
      {role === "seller" ? (
        <div>
          <label htmlFor="shopName" className="mb-1.5 block text-sm font-medium">
            Shop name
          </label>
          <input
            id="shopName"
            required
            minLength={2}
            value={shopName}
            onChange={(event) => setShopName(event.target.value)}
            className={fieldClass()}
            placeholder="e.g. Dhaka Book House"
          />
        </div>
      ) : null}
      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
          Phone <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className={fieldClass()}
          placeholder="+8801..."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium">
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={fieldClass()}
          />
        </div>
        <div>
          <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            className={fieldClass()}
          />
        </div>
      </div>
      <SubmitButton pending={pending}>
        {pending ? "Creating account..." : `Create ${role} account`}
      </SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    const result = await postJson<{ message: string; resetUrl?: string }>(
      "/api/auth/forgot-password",
      { email },
    );
    setPending(false);
    if (!result.success || !result.data) {
      setError(result.message ?? "Unable to send a reset link.");
      return;
    }
    setMessage(result.data.message);
    setResetUrl(result.data.resetUrl ?? null);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <Alert kind="error">{error}</Alert> : null}
      {message ? (
        <Alert kind="success">
          {message}
          {resetUrl ? (
            <span className="mt-1 block">
              Development reset link:{" "}
              <Link href={resetUrl} className="font-semibold underline">
                open reset page
              </Link>
            </span>
          ) : null}
        </Alert>
      ) : null}
      <div>
        <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={fieldClass()}
          placeholder="you@example.com"
        />
      </div>
      <SubmitButton pending={pending}>
        {pending ? "Sending..." : "Send reset link"}
      </SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setPending(true);
    setError(null);
    const result = await postJson<{ message: string }>(
      "/api/auth/reset-password",
      { token, password },
    );
    setPending(false);
    if (!result.success || !result.data) {
      setError(result.message ?? "Unable to reset your password.");
      return;
    }
    setMessage(result.data.message);
  }

  if (!token) {
    return <Alert kind="error">This reset link is missing its token.</Alert>;
  }

  if (message) {
    return (
      <div className="space-y-4">
        <Alert kind="success">{message}</Alert>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
        >
          Go to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <Alert kind="error">{error}</Alert> : null}
      <div>
        <label htmlFor="reset-password" className="mb-1.5 block text-sm font-medium">
          New password
        </label>
        <input
          id="reset-password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={fieldClass()}
        />
      </div>
      <div>
        <label htmlFor="reset-confirm" className="mb-1.5 block text-sm font-medium">
          Confirm new password
        </label>
        <input
          id="reset-confirm"
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className={fieldClass()}
        />
      </div>
      <SubmitButton pending={pending}>
        {pending ? "Updating..." : "Update password"}
      </SubmitButton>
    </form>
  );
}

export function VerifyEmailForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function verify() {
    setPending(true);
    setError(null);
    const result = await postJson<{ message: string }>("/api/auth/verify-email", {
      token,
    });
    setPending(false);
    if (!result.success || !result.data) {
      setError(result.message ?? "Unable to verify your email.");
      return;
    }
    setMessage(result.data.message);
  }

  if (!token) {
    return <Alert kind="error">This verification link is missing its token.</Alert>;
  }

  if (message) {
    return (
      <div className="space-y-4">
        <Alert kind="success">{message}</Alert>
        <Link
          href="/login"
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
        >
          Continue to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? <Alert kind="error">{error}</Alert> : null}
      <p className="text-sm text-muted-foreground">
        Click the button below to verify your email address.
      </p>
      <button
        type="button"
        onClick={verify}
        disabled={pending}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
        {pending ? "Verifying..." : "Verify email"}
      </button>
    </div>
  );
}
