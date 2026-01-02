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

    const reviewedProductIds = await reviewRepository
      .createQueryBuilder('review')
      .select('review.productId')
      .where('review.userId = :userId', { userId })
      .getRawMany();

    const reviewedOrderIds = reviewedOrderItemIds.map(r => r.review_orderItemId);
    const reviewedProducts = reviewedProductIds.map(r => r.review_productId);

    const queryBuilder = orderItemRepository
      .createQueryBuilder('orderItem')
      .innerJoinAndSelect('orderItem.order', 'order')
      .where('order.userId = :userId', { userId })
      .andWhere('order.status = :status', { status: 'delivered' });

    if (reviewedOrderIds.length > 0) {
      queryBuilder.andWhere('orderItem.id NOT IN (:...reviewedOrderIds)', { reviewedOrderIds });
    }

    if (reviewedProducts.length > 0) {
      queryBuilder.andWhere('(orderItem.productId IS NULL OR orderItem.productId NOT IN (:...reviewedProducts))', { reviewedProducts });
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

  async hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    const orderItemRepository = AppDataSource.getRepository(OrderItem);

    const count = await orderItemRepository
      .createQueryBuilder('orderItem')
      .innerJoin('orderItem.order', 'order')
      .where('order.userId = :userId', { userId })
      .andWhere('order.status = :status', { status: 'delivered' })
      .andWhere('orderItem.productId = :productId', { productId })
      .getCount();

    return count > 0;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  }
}
