export interface Testimonial {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  review: string;
  bookTitle: string;
  isApproved: boolean;
  order?: number;
}
