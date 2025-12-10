import { AppDataSource } from '../../../config/database';
import { Product } from '../../../entity/Product';
import type { BestProduct } from '../domain/BestProduct';
import type { BestProductRepository } from './BestProductRepository';

const BEST_DISPLAY_CATEGORY_NAME = '베스트';

export class TypeORMBestProductRepository implements BestProductRepository {
  async findAll(): Promise<BestProduct[]> {
    const productRepository = AppDataSource.getRepository(Product);
    
    const products = await productRepository
      .createQueryBuilder('product')
      .innerJoin('product.displayCategory', 'displayCategory')
      .where('displayCategory.name = :name', { name: BEST_DISPLAY_CATEGORY_NAME })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('product.sortOrder', 'ASC')
      .getMany();

    return products.map((product, index) => this.toDto(product, index + 1));
  }

  private toDto(product: Product, rank: number): BestProduct {
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
      rank,
    };
  }
}
