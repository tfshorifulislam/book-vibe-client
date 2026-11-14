import type { Book } from "./book";

export interface Offer {
  id: string;
  title: string;
  description: string;
  discountPercent?: number;
  bannerImage?: string;
  startDate: string;
  expiryDate?: string;
  isActive: boolean;
  books: Book[];
}
