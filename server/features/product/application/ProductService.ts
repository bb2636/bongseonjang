import type { Product } from '../../../entity/Product';
import type { ProductDto, ProductDetailDto, ProductOptionDto, ProductImageDto, MainOptionDto, SubOptionDto, TimeDealProductDto } from '../domain/Product';
import type { ProductRepository, ProductFilter } from '../repository/ProductRepository';

export interface ReviewStats {
  reviewCount: number;
  averageRating: number;
}

export interface ReviewStatsProvider {
  getReviewStatsByProductId(productId: string): Promise<ReviewStats>;
}

export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly reviewStatsProvider?: ReviewStatsProvider,
  ) {}

  async getProductsByDisplayCategory(displayCategoryName: string, filter?: ProductFilter): Promise<ProductDto[]> {
    const products = await this.productRepository.findByDisplayCategory(displayCategoryName, filter);
    return products.map((product) => this.toDto(product));
  }

  async getAllProducts(filter?: ProductFilter): Promise<ProductDto[]> {
    const products = await this.productRepository.findAll(filter);
    return products.map((product) => this.toDto(product));
  }

  async getProductById(id: string): Promise<ProductDetailDto | null> {
    const product = await this.productRepository.findById(id);
    
    if (!product) {
      return null;
    }

    const reviewStats = this.reviewStatsProvider 
      ? await this.reviewStatsProvider.getReviewStatsByProductId(id)
      : { reviewCount: 0, averageRating: 0 };

    return this.toDetailDto(product, reviewStats);
  }

  async getRelatedProducts(productId: string, limit: number = 4): Promise<ProductDto[]> {
    const products = await this.productRepository.findRelatedProducts(productId, limit);
    return products.map((product) => this.toDto(product));
  }

  async getTimeDeals(limit: number = 10): Promise<TimeDealProductDto[]> {
    const products = await this.productRepository.findTimeDeals(limit);
    const now = Date.now();
    return products.map((product) => this.toTimeDealDto(product, now));
  }

  async getProductsByTag(tag: string, limit: number = 10): Promise<ProductDto[]> {
    const products = await this.productRepository.findByTag(tag, limit);
    return products.map((product) => this.toDto(product));
  }

  async getFreshProducts(limit: number = 10): Promise<ProductDto[]> {
    const products = await this.productRepository.findFreshProducts(limit);
    return products.map((product) => this.toDto(product));
  }

  private toTimeDealDto(product: Product, now: number): TimeDealProductDto {
    const baseDto = this.toDto(product);
    const saleEndAt = product.saleEndAt ? new Date(product.saleEndAt).toISOString() : '';
    const remainingSeconds = product.saleEndAt 
      ? Math.max(0, Math.floor((new Date(product.saleEndAt).getTime() - now) / 1000))
      : 0;

    return {
      ...baseDto,
      saleEndAt,
      remainingSeconds,
    };
  }

  private toDto(product: Product): ProductDto {
    const discountedPrice = product.isDiscounted
      ? Math.round(product.basePrice * (1 - product.discountRate / 100))
      : product.basePrice;

    const thumbnailImage = product.images?.find((img) => img.isThumbnail);

    return {
      id: product.id,
      name: product.name,
      imageUrl: thumbnailImage?.imageUrl,
      originalPrice: product.basePrice,
      discountPercent: product.isDiscounted ? product.discountRate : 0,
      discountedPrice,
    };
  }

  private toDetailDto(product: Product, reviewStats: ReviewStats): ProductDetailDto {
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

    const mainOptions: MainOptionDto[] = (product.mainOptions || []).map((option) => ({
      id: option.id,
      groupName: option.groupName,
      name: option.name,
      price: option.price,
      compareAtPrice: option.compareAtPrice ?? undefined,
      stockQty: option.stockQty,
      isDefault: option.isDefault,
    }));

    const subOptions: SubOptionDto[] = (product.subOptions || []).map((option) => ({
      id: option.id,
      groupName: option.groupName,
      name: option.name,
      additionalPrice: option.additionalPrice,
      stockQty: option.stockQty,
      isDefault: option.isDefault,
    }));

    const lowestPrice = mainOptions.length > 0
      ? Math.min(...mainOptions.map((opt) => opt.price))
      : discountedPrice;

    const images: ProductImageDto[] = (product.images || []).map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
      imageType: image.imageType as 'THUMBNAIL' | 'DETAIL' | 'GALLERY',
      sortOrder: image.sortOrder,
    }));

    const thumbnailImage = product.images?.find((img) => img.isThumbnail);

    return {
      id: product.id,
      name: product.name,
      summary: product.summary ?? undefined,
      description: product.description ?? undefined,
      thumbnailUrl: thumbnailImage?.imageUrl,
      basePrice: product.basePrice,
      discountRate: product.discountRate,
      isDiscounted: product.isDiscounted,
      discountedPrice,
      lowestPrice,
      origin: product.origin ?? undefined,
      storageMethod: product.storageMethod ?? undefined,
      expirationInfo: product.expirationInfo ?? undefined,
      shippingMethod: product.shippingMethod ?? undefined,
      shippingRegion: product.shippingRegion ?? undefined,
      notice: product.notice ?? undefined,
      isOptionRequired: product.isOptionRequired,
      saleStartAt: product.saleStartAt ? new Date(product.saleStartAt).toISOString() : undefined,
      saleEndAt: product.saleEndAt ? new Date(product.saleEndAt).toISOString() : undefined,
      options,
      mainOptions,
      subOptions,
      images,
      reviewCount: reviewStats.reviewCount,
      averageRating: reviewStats.averageRating,
    };
  }
}
