export type BookCondition = "NEW" | "LIKE_NEW" | "GOOD" | "ACCEPTABLE" | "POOR";

export type ListingType = "NEW" | "USED";

export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  publisher?: string;
  isbn?: string;
  coverImage?: string;
  /** Optional deterministic cover tone (1-6) used by the CSS book cover. */
  coverTone?: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  condition: BookCondition;
  listingType?: ListingType;
  stock: number;
  sellerName: string;
  sellerId: string;
  sellerShopSlug?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  /** Sales-based ranking value supplied by the API. */
  salesCount?: number;
  /** ISO date the listing was published. */
  listedAt?: string;
}
