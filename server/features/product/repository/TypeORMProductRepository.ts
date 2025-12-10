import { AppDataSource } from '../../../config/database';
import { Product } from '../../../entity/Product';
import type { ProductDto } from '../domain/Product';
import type { ProductRepository, ProductFilter } from './ProductRepository';

export class TypeORMProductRepository implements ProductRepository {
  async findByDisplayCategory(displayCategoryName: string, filter?: ProductFilter): Promise<ProductDto[]> {
    const productRepository = AppDataSource.getRepository(Product);
    
    const queryBuilder = productRepository
      .createQueryBuilder('product')
      .innerJoin('product.displayCategory', 'displayCategory')
      .where('displayCategory.name = :displayName', { displayName: displayCategoryName })
      .andWhere('product.isActive = :isActive', { isActive: true });

    if (filter?.productCategory) {
      queryBuilder
        .innerJoin('product.productCategory', 'productCategory')
        .andWhere('productCategory.name = :productCategoryName', { productCategoryName: filter.productCategory });
    }

    const products = await queryBuilder
      .orderBy('product.sortOrder', 'ASC')
      .getMany();

    return products.map((product) => this.toDto(product));
  }

  async findAll(filter?: ProductFilter): Promise<ProductDto[]> {
    const productRepository = AppDataSource.getRepository(Product);
    
    const queryBuilder = productRepository
      .createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true });

    if (filter?.productCategory) {
      queryBuilder
        .innerJoin('product.productCategory', 'productCategory')
        .andWhere('productCategory.name = :productCategoryName', { productCategoryName: filter.productCategory });
    }

    const products = await queryBuilder
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
