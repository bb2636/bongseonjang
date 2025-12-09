export interface BadameunProduct {
  id: string;
  name: string;
  imageUrl?: string;
  originalPrice: number;
  discountPercent: number;
  discountedPrice: number;
  isFavorite?: boolean;
}
