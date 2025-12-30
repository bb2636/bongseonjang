import type { Review } from '../../../entity/Review';

export interface ReviewStats {
  reviewCount: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewRepository {
  findByProductId(productId: string): Promise<Review[]>;
  findByUserId(userId: string): Promise<Review[]>;
  findById(id: string): Promise<Review | null>;
  getStatsByProductId(productId: string): Promise<ReviewStats>;
  getStatsByProductIds(productIds: string[]): Promise<Map<string, { reviewCount: number; averageRating: number }>>;
  save(review: Partial<Review>): Promise<Review>;
  update(id: string, data: Partial<Review>): Promise<Review>;
  delete(id: string): Promise<void>;
  hasUserReviewedProduct(userId: string, productId: string): Promise<boolean>;
}
