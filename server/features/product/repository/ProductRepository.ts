import type { Product } from '../../../entity/Product';

export type SortBy = 'default' | 'newest' | 'priceAsc' | 'priceDesc' | 'discountDesc';

export interface ProductFilter {
  productCategory?: string;
  search?: string;
  sortBy?: SortBy;
}

export interface ProductRepository {
  findByDisplayCategory(displayCategoryName: string, filter?: ProductFilter): Promise<Product[]>;
  findAll(filter?: ProductFilter): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findRelatedProducts(productId: string, limit: number): Promise<Product[]>;
}
