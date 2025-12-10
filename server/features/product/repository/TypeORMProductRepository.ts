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

    return queryBuilder
      .orderBy('product.sortOrder', 'ASC')
      .getMany();
  }

  async findById(id: string): Promise<Product | null> {
    const productRepository = AppDataSource.getRepository(Product);
    
    return productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.options', 'options', 'options.isActive = :optionActive', { optionActive: true })
      .leftJoinAndSelect('product.images', 'images')
      .where('product.id = :id', { id })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('options.sortOrder', 'ASC')
      .addOrderBy('images.sortOrder', 'ASC')
      .getOne();
  }
}
