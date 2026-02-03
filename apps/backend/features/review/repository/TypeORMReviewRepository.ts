import { AppDataSource } from '../../../config/database';
import { Review } from '../../../entity/Review';
import type { ReviewRepository, ReviewStats } from './ReviewRepository';

export class TypeORMReviewRepository implements ReviewRepository {
  async findByProductId(productId: string): Promise<Review[]> {
    const reviewRepository = AppDataSource.getRepository(Review);
    
    return reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.productId = :productId', { productId })
      .orderBy('review.createdAt', 'DESC')
      .getMany();
  }

  async findByUserId(userId: string): Promise<Review[]> {
    const reviewRepository = AppDataSource.getRepository(Review);
    
    return reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product')
      .leftJoin('product.images', 'productImages', 'productImages.isThumbnail = :isThumbnail', { isThumbnail: true })
      .addSelect(['productImages.imageUrl'])
      .where('review.userId = :userId', { userId })
      .orderBy('review.createdAt', 'DESC')
      .getMany();
  }

  async findById(id: string): Promise<Review | null> {
    const reviewRepository = AppDataSource.getRepository(Review);
    
    return reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product')
      .leftJoin('product.images', 'productImages', 'productImages.isThumbnail = :isThumbnail', { isThumbnail: true })
      .addSelect(['productImages.imageUrl'])
      .where('review.id = :id', { id })
      .getOne();
  }

  async getStatsByProductId(productId: string): Promise<ReviewStats> {
    const reviewRepository = AppDataSource.getRepository(Review);
    
    const result = await reviewRepository
      .createQueryBuilder('review')
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(AVG(review.rating), 0)', 'average')
      .where('review.productId = :productId', { productId })
      .getRawOne();

    const distribution = await reviewRepository
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('review.productId = :productId', { productId })
      .groupBy('review.rating')
      .getRawMany();

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((row: { rating: number; count: string }) => {
      const rating = row.rating as 1 | 2 | 3 | 4 | 5;
      ratingDistribution[rating] = parseInt(row.count, 10);
    });

    const reviewCount = parseInt(result?.count || '0', 10);
    const averageRating = result?.average ? parseFloat(result.average) : 0;

    return {
      reviewCount,
      averageRating: Number.isNaN(averageRating) ? 0 : averageRating,
      ratingDistribution,
    };
  }

  async getStatsByProductIds(productIds: string[]): Promise<Map<string, { reviewCount: number; averageRating: number }>> {
    const result = new Map<string, { reviewCount: number; averageRating: number }>();
    
    if (productIds.length === 0) {
      return result;
    }

    const reviewRepository = AppDataSource.getRepository(Review);
    
    const stats = await reviewRepository
      .createQueryBuilder('review')
      .select('review.productId', 'productId')
      .addSelect('COUNT(*)', 'count')
      .addSelect('COALESCE(AVG(review.rating), 0)', 'average')
      .where('review.productId IN (:...productIds)', { productIds })
      .groupBy('review.productId')
      .getRawMany();

    for (const stat of stats) {
      result.set(stat.productId, {
        reviewCount: parseInt(stat.count, 10),
        averageRating: parseFloat(stat.average) || 0,
      });
    }

    return result;
  }

  async save(reviewData: Partial<Review>): Promise<Review> {
    const reviewRepository = AppDataSource.getRepository(Review);
    const review = reviewRepository.create(reviewData);
    return reviewRepository.save(review);
  }

  async update(id: string, data: Partial<Review>): Promise<Review> {
    const reviewRepository = AppDataSource.getRepository(Review);
    const review = await this.findById(id);
    
    if (!review) {
      throw new Error('Review not found');
    }

    if (data.rating !== undefined) {
      review.rating = data.rating;
    }
    if (data.content !== undefined) {
      review.content = data.content;
    }

    return reviewRepository.save(review);
  }

  async delete(id: string): Promise<void> {
    const reviewRepository = AppDataSource.getRepository(Review);
    await reviewRepository.delete(id);
  }

  async hasUserReviewedProduct(userId: string, productId: string): Promise<boolean> {
    const reviewRepository = AppDataSource.getRepository(Review);
    
    const review = await reviewRepository.findOne({
      where: { userId, productId },
    });

    return !!review;
  }

  async hasUserReviewedOrderItem(userId: string, orderItemId: string): Promise<boolean> {
    const reviewRepository = AppDataSource.getRepository(Review);
    
    const review = await reviewRepository.findOne({
      where: { userId, orderItemId },
    });

    return !!review;
  }
}
