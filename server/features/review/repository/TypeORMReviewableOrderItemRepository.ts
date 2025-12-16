import { AppDataSource } from '../../../config/database';
import { OrderItem } from '../../../entity/OrderItem';
import { Review } from '../../../entity/Review';
import { ReviewableOrderItemRepository } from './ReviewableOrderItemRepository';
import type { ReviewableOrderItemDto } from '../domain/Review';

export class TypeORMReviewableOrderItemRepository implements ReviewableOrderItemRepository {
  async findPendingReviewItemsByUserId(userId: string): Promise<ReviewableOrderItemDto[]> {
    const orderItemRepository = AppDataSource.getRepository(OrderItem);
    const reviewRepository = AppDataSource.getRepository(Review);

    const reviewedOrderItemIds = await reviewRepository
      .createQueryBuilder('review')
      .select('review.orderItemId')
      .where('review.userId = :userId', { userId })
      .andWhere('review.orderItemId IS NOT NULL')
      .getRawMany();

    const reviewedIds = reviewedOrderItemIds.map(r => r.review_orderItemId);

    const queryBuilder = orderItemRepository
      .createQueryBuilder('orderItem')
      .innerJoinAndSelect('orderItem.order', 'order')
      .where('order.userId = :userId', { userId })
      .andWhere('order.status = :status', { status: 'delivered' });

    if (reviewedIds.length > 0) {
      queryBuilder.andWhere('orderItem.id NOT IN (:...reviewedIds)', { reviewedIds });
    }

    const items = await queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .getMany();

    return items.map((item) => ({
      orderItemId: item.id,
      productId: item.productId || '',
      productName: item.productName,
      optionName: item.optionName,
      productImageUrl: item.productImageUrl,
      purchaseDate: this.formatDate(item.order?.createdAt || item.createdAt),
    }));
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  }
}
