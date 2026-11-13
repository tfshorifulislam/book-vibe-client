import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be at most 72 characters.");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(80),
  email: emailSchema,
  password: passwordSchema,
  phone: z.preprocess(emptyToUndefined, z.string().trim().max(20).optional()),
  role: z.enum(["buyer", "seller"]).default("buyer"),
  shopName: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(2).max(80).optional(),
  ),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({ token: z.string().min(10) });

export const addressSchema = z.object({
  label: z.string().trim().min(1).max(30).default("Home"),
  recipientName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(6).max(20),
  district: z.string().trim().min(2).max(60),
  city: z.string().trim().min(2).max(60),
  area: z.string().trim().min(2).max(120),
  postalCode: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(12).optional(),
  ),
  instructions: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(300).optional(),
  ),
  isDefault: z.coerce.boolean().optional(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.preprocess(emptyToUndefined, z.string().trim().max(20).optional()),
  avatar: z.preprocess(emptyToUndefined, z.string().trim().max(500).optional()),
  bio: z.preprocess(emptyToUndefined, z.string().trim().max(500).optional()),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export const bookSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.preprocess(emptyToUndefined, z.string().trim().max(180).optional()),
  description: z.string().trim().min(20).max(5000),
  authorId: z.string().min(1, "Choose an author."),
  categoryId: z.string().min(1, "Choose a category."),
  publisherId: z.preprocess(emptyToUndefined, z.string().optional()),
  isbn: z.preprocess(emptyToUndefined, z.string().trim().max(30).optional()),
  language: z.string().trim().min(1).max(40).default("English"),
  edition: z.preprocess(emptyToUndefined, z.string().trim().max(60).optional()),
  pageCount: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().int().min(1).max(20000).optional(),
  ),
  publicationDate: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
  coverImage: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(500).optional(),
  ),
  coverTone: z.coerce.number().int().min(1).max(6).default(1),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "ACCEPTABLE", "POOR"]),
  listingType: z.enum(["NEW", "USED"]),
  price: z.coerce.number().int().min(1).max(10000000),
  originalPrice: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().int().min(1).max(10000000).optional(),
  ),
  stock: z.coerce.number().int().min(0).max(1000000),
  lowStockAlert: z.coerce.number().int().min(0).max(1000).default(3),
  isFeatured: z.coerce.boolean().optional(),
  isNewArrival: z.coerce.boolean().optional(),
  isBestSeller: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const shopSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  description: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(1200).optional(),
  ),
  logo: z.preprocess(emptyToUndefined, z.string().trim().max(500).optional()),
  banner: z.preprocess(emptyToUndefined, z.string().trim().max(500).optional()),
  email: z.preprocess(emptyToUndefined, emailSchema.optional()),
  phone: z.preprocess(emptyToUndefined, z.string().trim().max(20).optional()),
  address: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(200).optional(),
  ),
  district: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(60).optional(),
  ),
  city: z.preprocess(emptyToUndefined, z.string().trim().max(60).optional()),
});

export const cartItemSchema = z.object({
  bookId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

export const cartUpdateSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.coerce.number().int().min(0).max(99),
});

export const checkoutSchema = z.object({
  addressId: z.preprocess(emptyToUndefined, z.string().optional()),
  address: addressSchema.optional(),
  paymentMethod: z.enum(["COD", "BKASH", "NAGAD", "CARD"]).default("COD"),
  couponCode: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(30).optional(),
  ),
  notes: z.preprocess(emptyToUndefined, z.string().trim().max(500).optional()),
});

export const reviewSchema = z.object({
  bookId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.preprocess(emptyToUndefined, z.string().trim().max(120).optional()),
  body: z.string().trim().min(5).max(2000),
});

export const questionSchema = z.object({
  bookId: z.string().min(1),
  body: z.string().trim().min(5).max(1000),
});

export const answerSchema = z.object({
  questionId: z.string().min(1),
  body: z.string().trim().min(2).max(1500),
});

export const messageSchema = z.object({
  userId: z.string().min(1).optional(),
  conversationId: z.string().min(1).optional(),
  body: z.string().trim().min(1).max(3000),
});

export const couponSchema = z.object({
  code: z.string().trim().min(2).max(30).toUpperCase(),
  description: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(300).optional(),
  ),
  type: z.enum(["FIXED", "PERCENT", "FREE_SHIPPING"]),
  value: z.coerce.number().int().min(0).max(1000000),
  minOrder: z.coerce.number().int().min(0).max(10000000).default(0),
  maxDiscount: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().int().min(0).max(10000000).optional(),
  ),
  usageLimit: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().int().min(1).max(1000000).optional(),
  ),
  perUserLimit: z.coerce.number().int().min(1).max(100).default(1),
  isActive: z.coerce.boolean().optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9/-]+$/),
  description: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(500).optional(),
  ),
  icon: z.preprocess(emptyToUndefined, z.string().trim().max(60).optional()),
  parentId: z.preprocess(emptyToUndefined, z.string().optional()),
  order: z.coerce.number().int().min(0).max(1000).default(0),
  isActive: z.coerce.boolean().optional(),
});

export const authorSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9-]+$/),
  bio: z.preprocess(emptyToUndefined, z.string().trim().max(2000).optional()),
  image: z.preprocess(emptyToUndefined, z.string().trim().max(500).optional()),
});

export const publisherSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9-]+$/),
  description: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(2000).optional(),
  ),
  logo: z.preprocess(emptyToUndefined, z.string().trim().max(500).optional()),
});

export const orderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
  note: z.preprocess(emptyToUndefined, z.string().trim().max(500).optional()),
  trackingNumber: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(80).optional(),
  ),
  carrier: z.preprocess(emptyToUndefined, z.string().trim().max(80).optional()),
});

export const adminUserSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  role: z.enum(["BUYER", "SELLER", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  emailVerified: z.coerce.boolean().optional(),
});

export const newsletterSchema = z.object({ email: emailSchema });

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailSchema,
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(3000),
});

export const refundRequestSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  reason: z
    .string()
    .trim()
    .min(5, "Please provide a detailed reason (at least 5 characters).")
    .max(500),
  amount: z.coerce.number().int().positive().optional(),
  note: z.string().trim().max(300).optional(),
});

export const disputeRequestSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  reason: z
    .string()
    .trim()
    .min(5, "Please provide dispute details (at least 5 characters).")
    .max(1000),
});
