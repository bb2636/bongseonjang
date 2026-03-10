export interface LargeProduct {
  id: string;
  name: string;
  imageUrl?: string;
  discountPercent: number;
  discountedPrice: number;
  originalPrice?: number;
  stockQuantity?: number;
  mainOptions?: Array<{ stockQty: number }>;
  saleStartAt?: string | null;
  saleEndAt?: string | null;
}
