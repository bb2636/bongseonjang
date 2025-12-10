import { AppDataSource } from '../../../config/database';
import { Product } from '../../../entity/Product';
import type { ProductDto } from '../domain/Product';
import type { ProductRepository } from './ProductRepository';

export class TypeORMProductRepository implements ProductRepository {
  async findByDisplayCategory(categoryName: string): Promise<ProductDto[]> {
    const productRepository = AppDataSource.getRepository(Product);
    
    const products = await productRepository
      .createQueryBuilder('product')
      .innerJoin('product.displayCategory', 'displayCategory')
      .where('displayCategory.name = :name', { name: categoryName })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('product.sortOrder', 'ASC')
      .getMany();

    return products.map((product) => this.toDto(product));
  }

  async findAll(): Promise<ProductDto[]> {
    const productRepository = AppDataSource.getRepository(Product);
    
    const products = await productRepository
      .createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true })
      .orderBy('product.sortOrder', 'ASC')
      .getMany();

    return products.map((product) => this.toDto(product));
  }

  private toDto(product: Product): ProductDto {
    const discountedPrice = product.isDiscounted
      ? Math.round(product.basePrice * (1 - product.discountRate / 100))
      : product.basePrice;

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.thumbnailUrl ?? undefined,
      originalPrice: product.basePrice,
      discountPercent: product.isDiscounted ? product.discountRate : 0,
      discountedPrice,
    };
  }
}
