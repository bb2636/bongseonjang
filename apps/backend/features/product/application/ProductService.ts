import type { Product } from '../../../entity/Product';
import type { ProductDto, ProductDetailDto, ProductOptionDto, ProductImageDto, TimeDealProductDto, MainOptionDto } from '../domain/Product';
import type { ProductRepository, ProductFilter } from '../repository/ProductRepository';
import { toAbsoluteImageUrl } from '../../../common/utils/imageUrl.js';
import { AppDataSource } from '../../../config/database.js';
import { ProductExposureCategory } from '../../../entity/ProductExposureCategory.js';

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

  async getProductsByDisplayCategory(displayCategoryName: string, filter?: ProductFilter, limit?: number): Promise<ProductDto[]> {
    const products = await this.productRepository.findByDisplayCategory(displayCategoryName, filter, limit);
    
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

    const exposureCategoryRepo = AppDataSource.getRepository(ProductExposureCategory);
    const exposureCategories = await exposureCategoryRepo.find({ where: { productId: id } });
    const exposureCategoryIds = exposureCategories.map(ec => Number(ec.exposureCategoryId));

    return this.toDetailDto(product, reviewStats, exposureCategoryIds);
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

  async getProductsByTag(tag: string, limit: number = 100, filter?: ProductFilter): Promise<ProductDto[]> {
    const products = await this.productRepository.findByTag(tag, limit, filter);
    return products.map((product) => this.toDto(product));
  }

  async getFreshProducts(limit: number = 10, filter?: ProductFilter): Promise<ProductDto[]> {
    const products = await this.productRepository.findFreshProducts(limit, filter);
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
      } catch {
        detailContent = { description: product.detailContent };
      }
    }
    
    const originInfo = detailContent.productInfos?.find(info => info.label === '원산지');
    const summaryInfo = detailContent.productInfos?.find(info => info.label === '상품요약' || info.label === '요약');
    
    const mainOptions: MainOptionDto[] = (product.options || []).slice(0, 3).map((option) => ({
      id: String(option.id),
      groupName: option.optionName || '옵션',
      name: option.optionValue,
      additionalPrice: option.price ?? 0,
      stockQty: product.stockQuantity ?? 0,
      isDefault: option.sortOrder === 0,
    }));

    const discountRate = product.discountRate ?? 0;
    const discountedPrice = discountRate > 0
      ? (product.discountedPrice ?? Math.round(product.basePrice * (1 - discountRate / 100)))
      : product.basePrice;

    return {
      id: product.id,
      name: product.name,
      imageUrl: toAbsoluteImageUrl(thumbnailImage?.imageUrl),
      originalPrice: product.basePrice,
      discountPercent: discountRate,
      discountedPrice: discountedPrice,
      summary: summaryInfo?.value || detailContent.description?.substring(0, 100),
      origin: originInfo?.value,
      reviewCount: reviewStats?.reviewCount ?? 0,
      averageRating: reviewStats?.averageRating ?? 0,
      mainOptions: mainOptions.length > 0 ? mainOptions : undefined,
      stockQuantity: product.stockQuantity ?? 0,
      saleStartAt: product.saleStartDate ? new Date(product.saleStartDate).toISOString() : null,
      saleEndAt: product.saleEndDate ? new Date(product.saleEndDate).toISOString() : null,
    };
  }

  private toDetailDto(product: Product, reviewStats: ReviewStats, exposureCategoryIds: number[] = []): ProductDetailDto {
    const options: ProductOptionDto[] = (product.options || []).map((option) => ({
      id: String(option.id),
      name: option.optionValue,
      additionalPrice: option.price ?? 0,
      stockQty: product.stockQuantity ?? 0,
      isDefault: option.sortOrder === 0,
    }));

    const lowestAdditionalPrice = options.length > 0
      ? Math.min(...options.map((opt) => opt.additionalPrice))
      : 0;
    const lowestPrice = product.basePrice + lowestAdditionalPrice;

    const images: ProductImageDto[] = (product.images || []).map((image) => ({
      id: String(image.id),
      imageUrl: toAbsoluteImageUrl(image.imageUrl),
      imageType: image.imageType as 'THUMBNAIL' | 'DETAIL' | 'GALLERY',
      sortOrder: image.sortOrder,
    }));

    const thumbnailImage = product.images?.find((img) => img.isThumbnail);

    const DEFAULT_FREE_SHIPPING_THRESHOLD = 30000;
    let shippingInfo = {
      shippingFee: product.shippingPolicy?.shippingFee ?? 0,
      freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD as number | null,
    };
    
    let descriptionText: string | undefined = undefined;
    let noticeText: string | undefined = undefined;
    let productInfos: Array<{ label: string; value: string }> = [];
    let shippingDetails: Array<{ label: string; value: string }> = [];
    
    if (product.detailContent) {
      try {
        const parsedContent = JSON.parse(product.detailContent);
        descriptionText = parsedContent.description || undefined;
        noticeText = parsedContent.caution || undefined;
        productInfos = parsedContent.productInfos || [];
        shippingDetails = parsedContent.shippingDetails || [];
        if (parsedContent.shippingInfo) {
          shippingInfo.shippingFee = parsedContent.shippingInfo.shippingFee ?? 0;
          shippingInfo.freeShippingThreshold = parsedContent.shippingInfo.freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD;
        }
      } catch {
        descriptionText = product.detailContent;
      }
    }

    const discountRate = product.discountRate ?? 0;
    const discountedPrice = discountRate > 0
      ? (product.discountedPrice ?? Math.round(product.basePrice * (1 - discountRate / 100)))
      : product.basePrice;

    return {
      id: product.id,
      name: product.name,
      summary: undefined,
      description: descriptionText,
      thumbnailUrl: toAbsoluteImageUrl(thumbnailImage?.imageUrl),
      basePrice: product.basePrice,
      discountRate: discountRate,
      isDiscounted: discountRate > 0,
      discountedPrice: discountedPrice,
      lowestPrice,
      weight: product.weight ?? undefined,
      origin: product.origin ?? undefined,
      storageMethod: product.storageMethod ?? undefined,
      expirationInfo: product.expirationInfo ?? undefined,
      shippingMethod: product.shippingMethod ?? undefined,
      shippingRegion: undefined,
      shippingFee: shippingInfo.shippingFee,
      freeShippingThreshold: shippingInfo.freeShippingThreshold,
      notice: noticeText,
      productInfos,
      shippingDetails,
      isOptionRequired: options.length > 0,
      saleStartAt: product.saleStartDate ? new Date(product.saleStartDate).toISOString() : undefined,
      saleEndAt: product.saleEndDate ? new Date(product.saleEndDate).toISOString() : undefined,
      options,
      mainOptions: [],
      subOptions: [],
      images,
      reviewCount: reviewStats.reviewCount,
      averageRating: reviewStats.averageRating,
      stockQuantity: product.stockQuantity ?? 0,
      productCategoryId: product.productCategoryId ? Number(product.productCategoryId) : null,
      exposureCategoryIds,
    };
  }
}
