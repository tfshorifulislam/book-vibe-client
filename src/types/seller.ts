export interface Seller {
  id: string;
  shopSlug: string;
  shopName: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  totalBooks: number;
  location?: string;
}

export type TopSeller = Seller;
