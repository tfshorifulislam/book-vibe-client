import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { CURRENCY } from "@/lib/constants";
import type { Book, BookCondition } from "@/types/book";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const priceFormatter = new Intl.NumberFormat(CURRENCY.locale, {
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat(CURRENCY.locale);

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatPrice(value: number): string {
  return `${CURRENCY.symbol}${priceFormatter.format(value)}`;
}

export const formatCurrency = formatPrice;

export function formatDateDisplay(
  date: Date | string | number,
  options?: { includeTime?: boolean }
): string {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  if (options?.includeTime) {
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return dateFormatter.format(date);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const CONDITION_LABELS: Record<BookCondition, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  ACCEPTABLE: "Acceptable",
  POOR: "Poor",
};

export function getConditionLabel(condition: BookCondition): string {
  return CONDITION_LABELS[condition];
}

export function getDiscountPercent(book: Book): number | null {
  if (book.discount && book.discount > 0) return Math.round(book.discount);
  if (book.originalPrice && book.originalPrice > book.price) {
    return Math.round(
      ((book.originalPrice - book.price) / book.originalPrice) * 100,
    );
  }
  return null;
}

export function getStockLabel(stock: number): string {
  if (stock <= 0) return "Out of stock";
  if (stock <= 3) return `Only ${stock} left`;
  return "In stock";
}
