import { AppDataSource } from '../../../config/database';
import { Product } from '../../../entity/Product';
import { ProductImage } from '../../../entity/ProductImage';
import type { BestProduct } from '../domain/BestProduct';
import type { BestProductRepository } from './BestProductRepository';

export class TypeORMBestProductRepository implements BestProductRepository {
  async findAll(): Promise<BestProduct[]> {
    const productRepository = AppDataSource.getRepository(Product);
    
    const products = await productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images', 'images.isThumbnail = :isThumbnail', { isThumbnail: true })
      .orderBy('product.createdAt', 'DESC')
      .limit(10)
      .getMany();

    return products.map((product, index) => this.toDto(product, index + 1));
  }

  private toDto(product: Product, rank: number): BestProduct {
    const thumbnailImage = product.images?.find((img: ProductImage) => img.isThumbnail);
    
    return {
      id: product.id,
      name: product.name,
      imageUrl: thumbnailImage?.imageUrl ?? undefined,
      originalPrice: product.basePrice,
      discountPercent: 0,
      discountedPrice: product.basePrice,
      rank,
    };
  }
}
