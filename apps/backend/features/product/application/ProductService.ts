import type { Product } from '../../../entity/Product';
import type { ProductDto, ProductDetailDto, ProductOptionDto, ProductImageDto, TimeDealProductDto, MainOptionDto } from '../domain/Product';
import type { ProductRepository, ProductFilter } from '../repository/ProductRepository';

export interface ReviewStats {
  reviewCount: number;
  averageRating: number;
}

export interface ReviewStatsProvider {
  getReviewStatsByProductId(productId: string): Promise<ReviewStats>;
  getReviewStatsByProductIds(productIds: string[]): Promise<Map<string, { reviewCount: number; averageRating: number }>>;
}

export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly reviewStatsProvider?: ReviewStatsProvider,
  ) {}

  async getProductsByDisplayCategory(displayCategoryName: string, filter?: ProductFilter): Promise<ProductDto[]> {
    const products = await this.productRepository.findByDisplayCategory(displayCategoryName, filter);
    
    const productIds = products.map(p => p.id);
    const reviewStatsMap = this.reviewStatsProvider 
      ? await this.reviewStatsProvider.getReviewStatsByProductIds(productIds)
      : new Map();
    
    return products.map((product) => this.toDto(product, reviewStatsMap.get(product.id)));
  }

  async getAllProducts(filter?: ProductFilter): Promise<ProductDto[]> {
    const products = await this.productRepository.findAll(filter);
    
    const productIds = products.map(p => p.id);
    const reviewStatsMap = this.reviewStatsProvider 
      ? await this.reviewStatsProvider.getReviewStatsByProductIds(productIds)
      : new Map();
    
    return products.map((product) => this.toDto(product, reviewStatsMap.get(product.id)));
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

  async getProductsByCategory(categoryId: string, page: number = 1, limit: number = 20): Promise<{ products: ProductDto[]; total: number; page: number; limit: number }> {
    const { products, total } = await this.productRepository.findByCategory(categoryId, page, limit);
    return {
      products: products.map((product) => this.toDto(product)),
      total,
      page,
      limit,
    };
  }

  private toTimeDealDto(product: Product, now: number): TimeDealProductDto {
    const baseDto = this.toDto(product);
    const saleEndAt = product.saleEndDate ? new Date(product.saleEndDate).toISOString() : '';
    const remainingSeconds = product.saleEndDate 
      ? Math.max(0, Math.floor((new Date(product.saleEndDate).getTime() - now) / 1000))
      : 0;

    return {
      ...baseDto,
      saleEndAt,
      remainingSeconds,
    };
  }

  private toDto(product: Product, reviewStats?: { reviewCount: number; averageRating: number }): ProductDto {
    const thumbnailImage = product.images?.find((img) => img.isThumbnail);
    
    let detailContent: { description?: string; productInfos?: Array<{ label: string; value: string }> } = {};
    if (product.detailContent) {
      try {
        detailContent = JSON.parse(product.detailContent);
      } catch (error) {
        console.warn(`Failed to parse detailContent for product ${product.id}:`, error);
        detailContent = {};
      }
    }
    
    const originInfo = detailContent.productInfos?.find(info => info.label === '원산지');
    const summaryInfo = detailContent.productInfos?.find(info => info.label === '상품요약' || info.label === '요약');
    
    const mainOptions: MainOptionDto[] = (product.options || []).slice(0, 3).map((option) => ({
      id: String(option.id),
      groupName: option.optionName || '옵션',
      name: option.optionValue,
      price: option.price ?? product.basePrice,
      stockQty: product.stockQuantity ?? 0,
      isDefault: option.sortOrder === 0,
    }));

    return {
      id: product.id,
      name: product.name,
      imageUrl: thumbnailImage?.imageUrl,
      originalPrice: product.basePrice,
      discountPercent: 0,
      discountedPrice: product.basePrice,
      summary: summaryInfo?.value || detailContent.description?.substring(0, 100),
      origin: originInfo?.value,
      reviewCount: reviewStats?.reviewCount ?? 0,
      averageRating: reviewStats?.averageRating ?? 0,
      mainOptions: mainOptions.length > 0 ? mainOptions : undefined,
    };
  }

  private toDetailDto(product: Product, reviewStats: ReviewStats): ProductDetailDto {
    const options: ProductOptionDto[] = (product.options || []).map((option) => ({
      id: String(option.id),
      name: option.optionValue,
      price: option.price ?? product.basePrice,
      stockQty: product.stockQuantity ?? 0,
      isDefault: option.sortOrder === 0,
    }));

    const lowestPrice = options.length > 0
      ? Math.min(...options.map((opt) => opt.price))
      : product.basePrice;

    const images: ProductImageDto[] = (product.images || []).map((image) => ({
      id: String(image.id),
      imageUrl: image.imageUrl,
      imageType: image.imageType as 'THUMBNAIL' | 'DETAIL' | 'GALLERY',
      sortOrder: image.sortOrder,
    }));

    const thumbnailImage = product.images?.find((img) => img.isThumbnail);

    return {
      id: product.id,
      name: product.name,
      summary: undefined,
      description: product.detailContent ?? undefined,
      thumbnailUrl: thumbnailImage?.imageUrl,
      basePrice: product.basePrice,
      discountRate: 0,
      isDiscounted: false,
      discountedPrice: product.basePrice,
      lowestPrice,
      origin: undefined,
      storageMethod: undefined,
      expirationInfo: undefined,
      shippingMethod: undefined,
      shippingRegion: undefined,
      notice: undefined,
      isOptionRequired: options.length > 0,
      saleStartAt: product.saleStartDate ? new Date(product.saleStartDate).toISOString() : undefined,
      saleEndAt: product.saleEndDate ? new Date(product.saleEndDate).toISOString() : undefined,
      options,
      mainOptions: [],
      subOptions: [],
      images,
      reviewCount: reviewStats.reviewCount,
      averageRating: reviewStats.averageRating,
    };
  }
}
