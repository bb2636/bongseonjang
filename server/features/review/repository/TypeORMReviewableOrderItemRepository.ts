import { AppDataSource } from '../../../config/database';
import { OrderItem } from '../../../entity/OrderItem';
import { ReviewableOrderItemRepository } from './ReviewableOrderItemRepository';
import type { ReviewableOrderItemDto } from '../domain/Review';

export class TypeORMReviewableOrderItemRepository implements ReviewableOrderItemRepository {
  async findPendingReviewItemsByUserId(userId: string): Promise<ReviewableOrderItemDto[]> {
    const repository = AppDataSource.getRepository(OrderItem);

    const items = await repository
      .createQueryBuilder('orderItem')
      .innerJoinAndSelect('orderItem.order', 'order')
      .where('order.userId = :userId', { userId })
      .andWhere('order.status = :status', { status: 'delivered' })
      .andWhere('orderItem.isReviewed = :isReviewed', { isReviewed: false })
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

  async markOrderItemAsReviewed(orderItemId: string): Promise<void> {
    const repository = AppDataSource.getRepository(OrderItem);
    await repository.update({ id: orderItemId }, { isReviewed: true });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  }
}
