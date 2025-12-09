export interface MdPickProduct {
  id: string;
  name: string;
  imageUrl?: string;
  discountPercent: number;
  discountedPrice: number;
}

export interface MdPickRepository {
  findAll(): Promise<MdPickProduct[]>;
}
