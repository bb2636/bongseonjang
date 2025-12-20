import { AppDataSource } from '../../../config/database';
import { Product } from '../../../entity/Product';
import type { ProductRepository, ProductFilter } from './ProductRepository';

export class TypeORMProductRepository implements ProductRepository {
  async findByDisplayCategory(displayCategoryName: string, filter?: ProductFilter): Promise<Product[]> {
    const productRepository = AppDataSource.getRepository(Product);
    
    const queryBuilder = productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images', 'images.isThumbnail = :isThumbnail', { isThumbnail: true })
      .innerJoin('product.productExposureCategories', 'pec')
      .innerJoin('pec.exposureCategory', 'exposureCategory')
      .where('exposureCategory.name = :displayName', { displayName: displayCategoryName });

    if (filter?.productCategory) {
      queryBuilder
        .innerJoin('product.productCategory', 'productCategory')
        .andWhere('productCategory.name = :productCategoryName', { productCategoryName: filter.productCategory });
    }

    return queryBuilder
      .orderBy('product.createdAt', 'DESC')
      .getMany();
  }

  async findAll(filter?: ProductFilter): Promise<Product[]> {
    const productRepository = AppDataSource.getRepository(Product);
    
    const queryBuilder = productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images', 'images.isThumbnail = :isThumbnail', { isThumbnail: true });

    if (filter?.productCategory) {
      queryBuilder
        .innerJoin('product.productCategory', 'productCategory')
        .andWhere('productCategory.name = :productCategoryName', { productCategoryName: filter.productCategory });
    }

    if (filter?.search) {
      queryBuilder.andWhere('product.name ILIKE :search', { search: `%${filter.search}%` });
    }

    switch (filter?.sortBy) {
      case 'newest':
        queryBuilder
          .orderBy('product.createdAt', 'DESC')
          .addOrderBy('product.id', 'ASC');
        break;
      case 'priceAsc':
        queryBuilder
          .orderBy('product.basePrice', 'ASC')
          .addOrderBy('product.id', 'ASC');
        break;
      case 'priceDesc':
        queryBuilder
          .orderBy('product.basePrice', 'DESC')
          .addOrderBy('product.id', 'ASC');
        break;
      case 'discountDesc':
        queryBuilder
          .orderBy('product.basePrice', 'DESC')
          .addOrderBy('product.id', 'ASC');
        break;
      default:
        queryBuilder
          .orderBy('product.createdAt', 'DESC')
          .addOrderBy('product.id', 'ASC');
        break;
    }

    return queryBuilder.getMany();
  }

  async findById(id: string): Promise<Product | null> {
    const productRepository = AppDataSource.getRepository(Product);
    
    return productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.options', 'options')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.id = :id', { id })
      .orderBy('images.sortOrder', 'ASC')
      .getOne();
  }

  async findRelatedProducts(productId: string, limit: number): Promise<Product[]> {
    const productRepository = AppDataSource.getRepository(Product);

    const currentProduct = await productRepository.findOne({
      where: { id: productId },
      select: ['productCategoryId'],
    });

    if (!currentProduct) {
      return [];
    }

    return productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images', 'images.isThumbnail = :isThumbnail', { isThumbnail: true })
      .where('product.productCategoryId = :categoryId', { categoryId: currentProduct.productCategoryId })
      .andWhere('product.id != :productId', { productId })
      .orderBy('product.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async findTimeDeals(limit: number = 10): Promise<Product[]> {
    const productRepository = AppDataSource.getRepository(Product);
    const now = new Date();

    return productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images', 'images.isThumbnail = :isThumbnail', { isThumbnail: true })
      .where('product.saleEndDate IS NOT NULL')
      .andWhere('product.saleEndDate > :now', { now })
      .andWhere('product.saleStartDate IS NULL OR product.saleStartDate <= :now', { now })
      .orderBy('product.saleEndDate', 'ASC')
      .limit(limit)
      .getMany();
  }

  async findByTag(tag: string, limit: number = 10): Promise<Product[]> {
    const productRepository = AppDataSource.getRepository(Product);

    return productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images', 'images.isThumbnail = :isThumbnail', { isThumbnail: true })
      .orderBy('product.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async findFreshProducts(limit: number = 10): Promise<Product[]> {
    const productRepository = AppDataSource.getRepository(Product);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    return productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images', 'images.isThumbnail = :isThumbnail', { isThumbnail: true })
      .where('product.createdAt >= :threeMonthsAgo', { threeMonthsAgo })
      .orderBy('product.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }
}
