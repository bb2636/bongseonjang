import { AppDataSource } from '../../../config/database';
import { Product } from '../../../entity/Product';
import type { ProductRepository, ProductFilter } from './ProductRepository';

export class TypeORMProductRepository implements ProductRepository {
  async findByDisplayCategory(displayCategoryName: string, filter?: ProductFilter): Promise<Product[]> {
    const productRepository = AppDataSource.getRepository(Product);
    const now = new Date();
    
    const queryBuilder = productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images', 'images.isThumbnail = :isThumbnail', { isThumbnail: true })
      .leftJoinAndSelect('product.options', 'options')
      .innerJoin('product.productExposureCategories', 'pec')
      .innerJoin('pec.exposureCategory', 'exposureCategory')
      .where('exposureCategory.name = :displayName', { displayName: displayCategoryName })
      .andWhere('(product.saleEndDate IS NULL OR product.saleEndDate > :now)', { now });

    if (filter?.productCategory) {
      queryBuilder.andWhere('product.productCategoryId = :productCategoryId', { productCategoryId: filter.productCategory });
    }

    return queryBuilder
      .orderBy('product.createdAt', 'DESC')
      .getMany();
  }

  async findAll(filter?: ProductFilter): Promise<Product[]> {
    const productRepository = AppDataSource.getRepository(Product);
    const now = new Date();
    
    const queryBuilder = productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images', 'images.isThumbnail = :isThumbnail', { isThumbnail: true })
      .leftJoinAndSelect('product.options', 'options')
      .where('(product.saleEndDate IS NULL OR product.saleEndDate > :now)', { now });

    if (filter?.productCategory) {
      queryBuilder.andWhere('product.productCategoryId = :productCategoryId', { productCategoryId: filter.productCategory });
    }

    if (filter?.search) {
      queryBuilder.andWhere('product.name ILIKE :search', { search: `%${filter.search}%` });
    }

    switch (filter?.sortBy) {
      case 'bestSelling':
        queryBuilder
          .leftJoin(
            subQuery => subQuery
              .select('oi.productId', 'productId')
              .addSelect('SUM(oi.quantity)', 'totalSales')
              .from('order_items', 'oi')
              .groupBy('oi.productId'),
            'sales',
            'sales.productId = product.id'
          )
          .orderBy('COALESCE(sales.totalSales, 0)', 'DESC')
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
      case 'ratingDesc':
        queryBuilder
          .leftJoin(
            subQuery => subQuery
              .select('r.productId', 'productId')
              .addSelect('AVG(r.rating)', 'avgRating')
              .from('reviews', 'r')
              .groupBy('r.productId'),
            'reviewStats',
            'reviewStats.productId = product.id'
          )
          .orderBy('COALESCE(reviewStats.avgRating, 0)', 'DESC')
          .addOrderBy('product.id', 'ASC');
        break;
      case 'reviewDesc':
        queryBuilder
          .leftJoin(
            subQuery => subQuery
              .select('r.productId', 'productId')
              .addSelect('COUNT(*)', 'reviewCount')
              .from('reviews', 'r')
              .groupBy('r.productId'),
            'reviewCounts',
            'reviewCounts.productId = product.id'
          )
          .orderBy('COALESCE(reviewCounts.reviewCount, 0)', 'DESC')
          .addOrderBy('product.id', 'ASC');
        break;
      case 'newest':
        queryBuilder
          .orderBy('product.createdAt', 'DESC')
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
      .leftJoinAndSelect('product.shippingPolicy', 'shippingPolicy')
      .where('product.id = :id', { id })
      .orderBy('images.sortOrder', 'ASC')
      .getOne();
  }

  async findRelatedProducts(productId: string, limit: number): Promise<Product[]> {
    const productRepository = AppDataSource.getRepository(Product);
    const now = new Date();

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
      .andWhere('(product.saleEndDate IS NULL OR product.saleEndDate > :now)', { now })
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
      .andWhere('product.saleEndDate <= :now + COALESCE(product.countdown_days, 7) * INTERVAL \'1 day\'', { now })
      .andWhere('(product.saleStartDate IS NULL OR product.saleStartDate <= :now)', { now })
      .orderBy('product.saleEndDate', 'ASC')
      .limit(limit)
      .getMany();
  }

  async findByTag(tag: string, limit: number = 100, filter?: ProductFilter): Promise<Product[]> {
    const productRepository = AppDataSource.getRepository(Product);
    const now = new Date();

    const queryBuilder = productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images', 'images.isThumbnail = :isThumbnail', { isThumbnail: true })
      .leftJoinAndSelect('product.options', 'options')
      .innerJoin('product.productExposureCategories', 'pec')
      .innerJoin('pec.exposureCategory', 'exposureCategory')
      .where('exposureCategory.name = :tagName', { tagName: tag })
      .andWhere('(product.saleEndDate IS NULL OR product.saleEndDate > :now)', { now });

    if (filter?.productCategory) {
      queryBuilder.andWhere('product.productCategoryId = :productCategoryId', { productCategoryId: filter.productCategory });
    }

    return queryBuilder
      .orderBy('product.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async findFreshProducts(limit: number = 10, filter?: ProductFilter): Promise<Product[]> {
    const productRepository = AppDataSource.getRepository(Product);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const now = new Date();

    const queryBuilder = productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images', 'images.isThumbnail = :isThumbnail', { isThumbnail: true })
      .where('product.createdAt >= :threeMonthsAgo', { threeMonthsAgo })
      .andWhere('(product.saleEndDate IS NULL OR product.saleEndDate > :now)', { now });

    if (filter?.productCategory) {
      queryBuilder
        .innerJoin('product.productCategory', 'productCategory')
        .andWhere('productCategory.id = :productCategoryId', { productCategoryId: filter.productCategory });
    }

    return queryBuilder
      .orderBy('product.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async findByCategory(categoryId: string, page: number = 1, limit: number = 20): Promise<{ products: Product[]; total: number }> {
    const productRepository = AppDataSource.getRepository(Product);
    const offset = (page - 1) * limit;
    const now = new Date();

    const [products, total] = await productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images', 'images.isThumbnail = :isThumbnail', { isThumbnail: true })
      .where('product.productCategoryId = :categoryId', { categoryId })
      .andWhere('(product.saleEndDate IS NULL OR product.saleEndDate > :now)', { now })
      .orderBy('product.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { products, total };
  }
}
