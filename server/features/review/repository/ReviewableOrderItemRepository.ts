import type { ReviewableOrderItemDto } from '../domain/Review';

export interface ReviewableOrderItemRepository {
  findPendingReviewItemsByUserId(userId: string): Promise<ReviewableOrderItemDto[]>;
  markOrderItemAsReviewed(orderItemId: string): Promise<void>;
}
