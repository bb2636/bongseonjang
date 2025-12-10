import { AppDataSource } from '../../../config/database';
import { Product } from '../../../entity/Product';
import type { ProductRepository, ProductFilter } from './ProductRepository';

export class TypeORMProductRepository implements ProductRepository {
  async findByDisplayCategory(displayCategoryName: string, filter?: ProductFilter): Promise<Product[]> {
    const productRepository = AppDataSource.getRepository(Product);
    
    const queryBuilder = productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images', 'images.isThumbnail = :isThumbnail', { isThumbnail: true })
      .innerJoin('product.displayCategory', 'displayCategory')
      .where('displayCategory.name = :displayName', { displayName: displayCategoryName })
      .andWhere('product.isActive = :isActive', { isActive: true });

    if (filter?.productCategory) {
      queryBuilder
        .innerJoin('product.productCategory', 'productCategory')
        .andWhere('productCategory.name = :productCategoryName', { productCategoryName: filter.productCategory });
    }

    return queryBuilder
      .orderBy('product.sortOrder', 'ASC')
      .getMany();
  }

  async findAll(filter?: ProductFilter): Promise<Product[]> {
    const productRepository = AppDataSource.getRepository(Product);
    
    const queryBuilder = productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images', 'images.isThumbnail = :isThumbnail', { isThumbnail: true })
      .where('product.isActive = :isActive', { isActive: true });

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
          .addOrderBy('product.sortOrder', 'ASC')
          .addOrderBy('product.id', 'ASC');
        break;
      case 'priceAsc':
        queryBuilder
          .orderBy('product.basePrice', 'ASC')
          .addOrderBy('product.sortOrder', 'ASC')
          .addOrderBy('product.id', 'ASC');
        break;
      case 'priceDesc':
        queryBuilder
          .orderBy('product.basePrice', 'DESC')
          .addOrderBy('product.sortOrder', 'ASC')
          .addOrderBy('product.id', 'ASC');
        break;
      case 'discountDesc':
        queryBuilder
          .orderBy('product.discountRate', 'DESC')
          .addOrderBy('product.sortOrder', 'ASC')
          .addOrderBy('product.id', 'ASC');
        break;
      default:
        queryBuilder
          .orderBy('product.sortOrder', 'ASC')
          .addOrderBy('product.id', 'ASC');
        break;
    }

    return queryBuilder.getMany();
  }

  async findById(id: string): Promise<Product | null> {
    const productRepository = AppDataSource.getRepository(Product);
    
    return productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.options', 'options', 'options.isActive = :optionActive', { optionActive: true })
      .leftJoinAndSelect('product.mainOptions', 'mainOptions', 'mainOptions.isActive = :mainOptionActive', { mainOptionActive: true })
      .leftJoinAndSelect('product.subOptions', 'subOptions', 'subOptions.isActive = :subOptionActive', { subOptionActive: true })
      .leftJoinAndSelect('product.images', 'images')
      .where('product.id = :id', { id })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('options.sortOrder', 'ASC')
      .addOrderBy('mainOptions.sortOrder', 'ASC')
      .addOrderBy('subOptions.sortOrder', 'ASC')
      .addOrderBy('images.sortOrder', 'ASC')
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
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('product.isDiscounted', 'DESC')
      .addOrderBy('product.sortOrder', 'ASC')
      .limit(limit)
      .getMany();
  }
}
