import type { ProductDto, ProductDetailDto } from '../domain/Product';

export interface ProductFilter {
  productCategory?: string;
}

export interface ProductRepository {
  findByDisplayCategory(displayCategoryName: string, filter?: ProductFilter): Promise<ProductDto[]>;
  findAll(filter?: ProductFilter): Promise<ProductDto[]>;
  findById(id: string): Promise<ProductDetailDto | null>;
}
