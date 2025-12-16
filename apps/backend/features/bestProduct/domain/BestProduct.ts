export interface BestProduct {
  id: string;
  name: string;
  imageUrl?: string;
  originalPrice: number;
  discountPercent: number;
  discountedPrice: number;
  rank: number;
}
