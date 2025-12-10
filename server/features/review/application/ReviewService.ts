import type { Review } from '../../../entity/Review';
import type { ReviewDto, ReviewStatsDto, CreateReviewRequest } from '../domain/Review';
import type { ReviewRepository } from '../repository/ReviewRepository';
import type { ReviewStatsProvider } from '../../product/application/ProductService';

export class ReviewService implements ReviewStatsProvider {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async getReviewsByProductId(productId: string): Promise<ReviewDto[]> {
    const reviews = await this.reviewRepository.findByProductId(productId);
    return reviews.map((review) => this.toDto(review));
  }

  async getReviewStatsByProductId(productId: string): Promise<ReviewStatsDto> {
    return this.reviewRepository.getStatsByProductId(productId);
  }

  async createReview(userId: string, request: CreateReviewRequest): Promise<ReviewDto> {
    const review = await this.reviewRepository.save({
      productId: request.productId,
      userId,
      rating: request.rating,
      content: request.content,
      imageUrls: request.imageUrls || null,
      isVerifiedPurchase: false,
    });

    const savedReview = await this.reviewRepository.findById(review.id);
    if (!savedReview) {
      throw new Error('Failed to save review');
    }

    return this.toDto(savedReview);
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
  }

  private toDto(review: Review): ReviewDto {
    return {
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      userName: review.user?.name || '익명',
      rating: review.rating,
      content: review.content,
      imageUrls: review.imageUrls || [],
      isVerifiedPurchase: review.isVerifiedPurchase,
      createdAt: review.createdAt.toISOString(),
    };
  }
}
