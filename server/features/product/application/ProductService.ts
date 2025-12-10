import type { Product } from '../../../entity/Product';
import type { ProductDto, ProductDetailDto, ProductOptionDto, ProductImageDto } from '../domain/Product';
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
      reviewCount: reviewStats.reviewCount,
      averageRating: reviewStats.averageRating,
    };
  }
}
