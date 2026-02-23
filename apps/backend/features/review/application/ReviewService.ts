import type { Review } from '../../../entity/Review';
import type { ReviewDto, ReviewStatsDto, CreateReviewRequest, UpdateReviewRequest, ReviewableOrderItemDto, MyReviewDto, CanReviewProductResult } from '../domain/Review';
import type { ReviewRepository } from '../repository/ReviewRepository';
import type { ReviewImageRepository } from '../repository/ReviewImageRepository';
import type { ReviewableOrderItemRepository } from '../repository/ReviewableOrderItemRepository';
import type { ReviewStatsProvider } from '../../product/application/ProductService';
import { toAbsoluteImageUrl } from '../../../common/utils/imageUrl.js';
import { MemoryCache } from '../../../common/utils/memoryCache.js';

const REVIEW_STATS_CACHE_TTL_MS = 600000;

const REVIEW_STATS_CACHE_MAX_SIZE = 50;
export const reviewStatsCache = new MemoryCache<Map<string, { reviewCount: number; averageRating: number }>>(REVIEW_STATS_CACHE_MAX_SIZE);

export class ReviewService implements ReviewStatsProvider {
  private static reviewStatsCache = reviewStatsCache;

  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly reviewImageRepository: ReviewImageRepository,
    private readonly reviewableOrderItemRepository: ReviewableOrderItemRepository
  ) {}

  async getReviewsByProductId(productId: string): Promise<ReviewDto[]> {
    const reviews = await this.reviewRepository.findByProductId(productId);
    const reviewIds = reviews.map(r => r.id);
    const allImages = await this.reviewImageRepository.findByReviewIds(reviewIds);
    
    const imagesByReviewId = new Map<string, string[]>();
    allImages.forEach(img => {
      const urls = imagesByReviewId.get(img.reviewId) || [];
      urls.push(img.imageUrl);
      imagesByReviewId.set(img.reviewId, urls);
    });

    return reviews.map((review) => this.toDto(review, imagesByReviewId.get(review.id) || []));
  }

  async getReviewStatsByProductId(productId: string): Promise<ReviewStatsDto> {
    return this.reviewRepository.getStatsByProductId(productId);
  }

  async getReviewStatsByProductIds(productIds: string[]): Promise<Map<string, { reviewCount: number; averageRating: number }>> {
    const cacheKey = [...productIds].sort().join(',');
    const cached = ReviewService.reviewStatsCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.reviewRepository.getStatsByProductIds(productIds);
    ReviewService.reviewStatsCache.set(cacheKey, result, REVIEW_STATS_CACHE_TTL_MS);
    return result;
  }

  async createReview(userId: string, request: CreateReviewRequest): Promise<ReviewDto> {
    if (!request.orderItemId) {
      throw new Error('주문 상품 정보가 필요합니다.');
    }

    const hasPurchasedOrderItem = await this.reviewableOrderItemRepository.hasUserPurchasedOrderItem(userId, request.orderItemId);
    if (!hasPurchasedOrderItem) {
      throw new Error('상품을 구매한 후에만 리뷰를 작성할 수 있습니다.');
    }

    const hasReviewed = await this.reviewRepository.hasUserReviewedOrderItem(userId, request.orderItemId);
    if (hasReviewed) {
      throw new Error('이미 리뷰를 작성하셨습니다.');
    }

    const review = await this.reviewRepository.save({
      productId: request.productId,
      userId,
      orderItemId: request.orderItemId,
      rating: request.rating,
      content: request.content,
    });

    const imageUrls: string[] = [];
    if (request.imageUrls && request.imageUrls.length > 0) {
      const reviewImages = request.imageUrls.map((url, index) => ({
        reviewId: review.id,
        imageUrl: url,
        sortOrder: index,
      }));
      await this.reviewImageRepository.saveMany(reviewImages);
      imageUrls.push(...request.imageUrls);
    }

    const savedReview = await this.reviewRepository.findById(review.id);
    if (!savedReview) {
      throw new Error('Failed to save review');
    }

    ReviewService.reviewStatsCache.invalidateAll();
    return this.toDto(savedReview, imageUrls);
  }

  async deleteReview(id: string, userId: string): Promise<void> {
    const review = await this.reviewRepository.findById(id);
    
    if (!review) {
      throw new Error('Review not found');
    }
    
    if (review.userId !== userId) {
      throw new Error('Unauthorized to delete this review');
    }

    await this.reviewRepository.delete(id);
    ReviewService.reviewStatsCache.invalidateAll();
  }

  async updateReview(id: string, userId: string, request: UpdateReviewRequest): Promise<ReviewDto> {
    const review = await this.reviewRepository.findById(id);
    
    if (!review) {
      throw new Error('Review not found');
    }
    
    if (review.userId !== userId) {
      throw new Error('Unauthorized to update this review');
    }

    await this.reviewImageRepository.deleteByReviewId(id);

    const imageUrls: string[] = [];
    if (request.imageUrls && request.imageUrls.length > 0) {
      const reviewImages = request.imageUrls.map((url, index) => ({
        reviewId: id,
        imageUrl: url,
        sortOrder: index,
      }));
      await this.reviewImageRepository.saveMany(reviewImages);
      imageUrls.push(...request.imageUrls);
    }

    const updatedReview = await this.reviewRepository.update(id, {
      rating: request.rating,
      content: request.content,
    });

    ReviewService.reviewStatsCache.invalidateAll();
    return this.toDto(updatedReview, imageUrls);
  }

  async hasUserReviewedProduct(userId: string, productId: string): Promise<boolean> {
    return this.reviewRepository.hasUserReviewedProduct(userId, productId);
  }

  async canUserReviewProduct(userId: string, productId: string): Promise<CanReviewProductResult> {
    const reviewableOrderItemId = await this.reviewableOrderItemRepository.findReviewableOrderItemForProduct(userId, productId);
    
    if (!reviewableOrderItemId) {
      const hasPurchased = await this.reviewableOrderItemRepository.hasUserPurchasedProduct(userId, productId);
      if (!hasPurchased) {
        return { canReview: false, reason: 'not_purchased' };
      }
      return { canReview: false, reason: 'already_reviewed' };
    }

    return { canReview: true, orderItemId: reviewableOrderItemId };
  }

  async canUserReviewOrderItem(userId: string, orderItemId: string): Promise<{ canReview: boolean; reason?: string }> {
    const hasPurchasedOrderItem = await this.reviewableOrderItemRepository.hasUserPurchasedOrderItem(userId, orderItemId);
    if (!hasPurchasedOrderItem) {
      return { canReview: false, reason: 'not_purchased' };
    }

    const hasReviewed = await this.reviewRepository.hasUserReviewedOrderItem(userId, orderItemId);
    if (hasReviewed) {
      return { canReview: false, reason: 'already_reviewed' };
    }

    return { canReview: true };
  }

  async getPendingReviewItems(userId: string): Promise<ReviewableOrderItemDto[]> {
    return this.reviewableOrderItemRepository.findPendingReviewItemsByUserId(userId);
  }

  async getMyReviews(userId: string): Promise<MyReviewDto[]> {
    const reviews = await this.reviewRepository.findByUserId(userId);
    const reviewIds = reviews.map(r => r.id);
    const allImages = await this.reviewImageRepository.findByReviewIds(reviewIds);
    
    const imagesByReviewId = new Map<string, string[]>();
    allImages.forEach(img => {
      const urls = imagesByReviewId.get(img.reviewId) || [];
      urls.push(img.imageUrl);
      imagesByReviewId.set(img.reviewId, urls);
    });

    return reviews.map((review) => this.toMyReviewDto(review, imagesByReviewId.get(review.id) || []));
  }

  async getReviewById(id: string, userId: string): Promise<MyReviewDto | null> {
    const review = await this.reviewRepository.findById(id);
    
    if (!review) {
      return null;
    }
    
    if (review.userId !== userId) {
      throw new Error('Unauthorized to view this review');
    }

    const images = await this.reviewImageRepository.findByReviewIds([id]);
    const imageUrls = images.map(img => img.imageUrl);
    
    return this.toMyReviewDto(review, imageUrls);
  }

  private toDto(review: Review, imageUrls: string[] = []): ReviewDto {
    return {
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      userName: review.user?.name || '익명',
      rating: review.rating,
      content: review.content,
      imageUrls: imageUrls.map(url => toAbsoluteImageUrl(url)),
      createdAt: review.createdAt.toISOString(),
    };
  }

  private toMyReviewDto(review: Review, imageUrls: string[] = []): MyReviewDto {
    const productImageUrl = toAbsoluteImageUrl(review.product?.images?.[0]?.imageUrl) || null;
    
    return {
      id: review.id,
      productId: review.productId,
      productName: review.product?.name || '상품명 없음',
      productImageUrl,
      rating: review.rating,
      content: review.content,
      imageUrls: imageUrls.map(url => toAbsoluteImageUrl(url)),
      createdAt: review.createdAt.toISOString(),
    };
  }
}
