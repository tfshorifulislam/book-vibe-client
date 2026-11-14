export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  bookCount: number;
  isActive: boolean;
  order: number;
  children?: Category[];
}
