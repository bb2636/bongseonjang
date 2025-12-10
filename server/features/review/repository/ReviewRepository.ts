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
  findById(id: string): Promise<Review | null>;
  getStatsByProductId(productId: string): Promise<ReviewStats>;
  save(review: Partial<Review>): Promise<Review>;
  delete(id: string): Promise<void>;
}
