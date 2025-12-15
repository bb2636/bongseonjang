import { In } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { ReviewImage } from '../../../entity/ReviewImage';
import type { ReviewImageRepository } from './ReviewImageRepository';

export class TypeORMReviewImageRepository implements ReviewImageRepository {
  async save(reviewImage: Partial<ReviewImage>): Promise<ReviewImage> {
    const repository = AppDataSource.getRepository(ReviewImage);
    const entity = repository.create(reviewImage);
    return repository.save(entity);
  }

  async saveMany(reviewImages: Partial<ReviewImage>[]): Promise<ReviewImage[]> {
    const repository = AppDataSource.getRepository(ReviewImage);
    const entities = reviewImages.map(img => repository.create(img));
    return repository.save(entities);
  }

  async findByReviewId(reviewId: string): Promise<ReviewImage[]> {
    const repository = AppDataSource.getRepository(ReviewImage);
    return repository.find({
      where: { reviewId },
      order: { sortOrder: 'ASC' },
    });
  }

  async findByReviewIds(reviewIds: string[]): Promise<ReviewImage[]> {
    if (reviewIds.length === 0) {
      return [];
    }
    const repository = AppDataSource.getRepository(ReviewImage);
    return repository.find({
      where: { reviewId: In(reviewIds) },
      order: { sortOrder: 'ASC' },
    });
  }

  async deleteByReviewId(reviewId: string): Promise<void> {
    const repository = AppDataSource.getRepository(ReviewImage);
    await repository.delete({ reviewId });
  }
}
