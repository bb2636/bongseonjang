export interface TimeDeal {
  id: string;
  name: string;
  imageUrl?: string;
  originalPrice: number;
  discountPercent: number;
  discountedPrice: number;
  saleEndAt: string;
  remainingSeconds: number;
}
