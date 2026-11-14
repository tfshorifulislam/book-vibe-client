import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
    .optional()
    .default("http://localhost:3000"),
  SESSION_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export function validateEnv(): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isProduction = process.env.NODE_ENV === "production";

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push(`${issue.path.join(".")}: ${issue.message}`);
    }
  }

  // Production-specific security & credentials validations
  if (isProduction) {
    if (!process.env.SESSION_SECRET) {
      errors.push(
        "SESSION_SECRET must be configured in production for secure session signing.",
      );
    } else if (process.env.SESSION_SECRET.length < 32) {
      warnings.push(
        "SESSION_SECRET is shorter than 32 characters; recommend using a strong 32+ character random secret.",
      );
    }

    if (!process.env.RESEND_API_KEY) {
      warnings.push(
        "RESEND_API_KEY is not set. Transactional emails will fall back to simulation mode.",
      );
    }

    if (
      process.env.EMAIL_FROM &&
      /@(gmail|yahoo|hotmail|outlook)\.com/i.test(process.env.EMAIL_FROM)
    ) {
      warnings.push(
        "EMAIL_FROM uses a public webmail domain. Resend requires a verified custom domain in production.",
      );
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      warnings.push(
        "Cloudinary credentials are not fully configured. Image uploads will require local storage fallback.",
      );
    }
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}
