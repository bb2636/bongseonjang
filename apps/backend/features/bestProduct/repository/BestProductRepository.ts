import type { BestProduct } from '../domain/BestProduct';

export interface BestProductFilter {
  productCategoryId?: string;
}

export interface BestProductRepository {
  findAll(filter?: BestProductFilter): Promise<BestProduct[]>;
}
