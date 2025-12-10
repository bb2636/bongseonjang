import type { ProductDto } from '../domain/Product';

export interface ProductRepository {
  findByDisplayCategory(categoryName: string): Promise<ProductDto[]>;
  findAll(): Promise<ProductDto[]>;
}
