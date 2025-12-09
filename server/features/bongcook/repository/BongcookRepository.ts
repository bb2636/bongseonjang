export interface BongcookProduct {
  id: string;
  name: string;
  imageUrl: string;
  originalPrice: number;
  discountPercent: number;
  discountedPrice: number;
  isFavorite: boolean;
}

export interface BongcookRepository {
  findAll(): Promise<BongcookProduct[]>;
}
