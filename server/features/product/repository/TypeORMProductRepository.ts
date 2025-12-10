import { AppDataSource } from '../../../config/database';
import { Product } from '../../../entity/Product';
import type { ProductDto, ProductDetailDto, ProductOptionDto, ProductImageDto } from '../domain/Product';
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

  async findById(id: string): Promise<ProductDetailDto | null> {
    const productRepository = AppDataSource.getRepository(Product);
    
    const product = await productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.options', 'options', 'options.isActive = :optionActive', { optionActive: true })
      .leftJoinAndSelect('product.images', 'images')
      .where('product.id = :id', { id })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('options.sortOrder', 'ASC')
      .addOrderBy('images.sortOrder', 'ASC')
      .getOne();

    if (!product) {
      return null;
    }

    return this.toDetailDto(product);
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

  private toDetailDto(product: Product): ProductDetailDto {
    const discountedPrice = product.isDiscounted
      ? Math.round(product.basePrice * (1 - product.discountRate / 100))
      : product.basePrice;

    const options: ProductOptionDto[] = (product.options || []).map((option) => ({
      id: option.id,
      name: option.name,
      price: option.price,
      compareAtPrice: option.compareAtPrice ?? undefined,
      stockQty: option.stockQty,
      isDefault: option.isDefault,
    }));

    const images: ProductImageDto[] = (product.images || []).map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
      imageType: image.imageType as 'THUMBNAIL' | 'DETAIL' | 'GALLERY',
      sortOrder: image.sortOrder,
    }));

    return {
      id: product.id,
      name: product.name,
      summary: product.summary ?? undefined,
      description: product.description ?? undefined,
      thumbnailUrl: product.thumbnailUrl ?? undefined,
      basePrice: product.basePrice,
      discountRate: product.discountRate,
      isDiscounted: product.isDiscounted,
      discountedPrice,
      origin: product.origin ?? undefined,
      storageMethod: product.storageMethod ?? undefined,
      expirationInfo: product.expirationInfo ?? undefined,
      shippingFee: product.shippingFee,
      shippingMethod: product.shippingMethod ?? undefined,
      shippingRegion: product.shippingRegion ?? undefined,
      notice: product.notice ?? undefined,
      isOptionRequired: product.isOptionRequired,
      options,
      images,
      reviewCount: 0,
      averageRating: 0,
    };
  }
}
