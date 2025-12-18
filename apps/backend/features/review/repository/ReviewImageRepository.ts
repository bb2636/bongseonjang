import { ReviewImage } from '../../../entity/ReviewImage';

export interface ReviewImageRepository {
  save(reviewImage: Partial<ReviewImage>): Promise<ReviewImage>;
  saveMany(reviewImages: Partial<ReviewImage>[]): Promise<ReviewImage[]>;
  findByReviewId(reviewId: string): Promise<ReviewImage[]>;
  findByReviewIds(reviewIds: string[]): Promise<ReviewImage[]>;
  deleteByReviewId(reviewId: string): Promise<void>;
}
