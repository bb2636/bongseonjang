import type { ReviewableOrderItemDto } from '../domain/Review';

export interface ReviewableOrderItemRepository {
  findPendingReviewItemsByUserId(userId: string): Promise<ReviewableOrderItemDto[]>;
  hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean>;
}
