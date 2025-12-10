import type { ProductDto } from '../domain/Product';

export interface ProductFilter {
  productCategory?: string;
}

export interface ProductRepository {
  findByDisplayCategory(displayCategoryName: string, filter?: ProductFilter): Promise<ProductDto[]>;
  findAll(filter?: ProductFilter): Promise<ProductDto[]>;
}
