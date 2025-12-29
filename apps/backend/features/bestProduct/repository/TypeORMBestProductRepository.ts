import { AppDataSource } from '../../../config/database.js';
import { Product } from '../../../entity/Product.js';
import { ProductImage } from '../../../entity/ProductImage.js';
import type { BestProduct } from '../domain/BestProduct.js';
import type { BestProductRepository, BestProductFilter } from './BestProductRepository.js';
import { toAbsoluteImageUrl } from '../../../common/utils/imageUrl.js';

export class TypeORMBestProductRepository implements BestProductRepository {
  async findAll(filter?: BestProductFilter): Promise<BestProduct[]> {
    const productRepository = AppDataSource.getRepository(Product);
    
    const queryBuilder = productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images', 'images.isThumbnail = :isThumbnail', { isThumbnail: true })
      .leftJoin('order_items', 'oi', 'oi."productId" = product.id');

    if (filter?.productCategoryId) {
      queryBuilder.andWhere('product.productCategoryId = :categoryId', { categoryId: filter.productCategoryId });
    }

    const productsWithSales = await queryBuilder
      .addSelect('COALESCE(SUM(oi.quantity), 0)', 'totalSold')
      .groupBy('product.id')
      .addGroupBy('images.id')
      .orderBy('COALESCE(SUM(oi.quantity), 0)', 'DESC')
      .addOrderBy('product.createdAt', 'DESC')
      .limit(10)
      .getRawAndEntities();

    const { entities, raw } = productsWithSales;
    
    const productSalesMap = new Map<string, number>();
    for (const r of raw) {
      const productId = r.product_id;
      const sold = parseInt(r.totalSold, 10) || 0;
      if (!productSalesMap.has(productId) || sold > (productSalesMap.get(productId) ?? 0)) {
        productSalesMap.set(productId, sold);
      }
    }

    const uniqueProducts = entities.filter((product: Product, index: number, self: Product[]) =>
      index === self.findIndex((p: Product) => p.id === product.id)
    );

    uniqueProducts.sort((a: Product, b: Product) => {
      const salesA = productSalesMap.get(a.id) ?? 0;
      const salesB = productSalesMap.get(b.id) ?? 0;
      if (salesB !== salesA) {
        return salesB - salesA;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return uniqueProducts.slice(0, 10).map((product: Product, index: number) => this.toDto(product, index + 1));
  }

  private toDto(product: Product, rank: number): BestProduct {
    const thumbnailImage = product.images?.find((img: ProductImage) => img.isThumbnail);
    
    return {
      id: product.id,
      name: product.name,
      imageUrl: toAbsoluteImageUrl(thumbnailImage?.imageUrl) || undefined,
      originalPrice: product.basePrice,
      discountPercent: 0,
      discountedPrice: product.basePrice,
      rank,
    };
  }
}
