import type { Product } from '../../../entity/Product';

export type SortBy = 'default' | 'bestSelling' | 'priceAsc' | 'priceDesc' | 'ratingDesc' | 'reviewDesc' | 'newest';

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
  findTimeDeals(limit?: number): Promise<Product[]>;
  findByTag(tag: string, limit?: number, filter?: ProductFilter): Promise<Product[]>;
  findFreshProducts(limit?: number, filter?: ProductFilter): Promise<Product[]>;
  findByCategory(categoryId: string, page: number, limit: number): Promise<{ products: Product[]; total: number }>;
}
