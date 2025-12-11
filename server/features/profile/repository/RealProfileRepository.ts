import { ProfileRepository } from './ProfileRepository';
import { UserProfile, Order } from '../domain/Profile';
import { AppDataSource } from '../../../config/database';
import { User, MembershipGrade } from '../../../entity/User';
import { PointWallet } from '../../../entity/PointWallet';
import { CouponIssuance } from '../../../entity/CouponIssuance';
import { WishlistItem } from '../../../entity/WishlistItem';
import { OrderItem } from '../../../entity/OrderItem';
import { Order as OrderEntity } from '../../../entity/Order';

const GRADE_DISPLAY_MAP: Record<MembershipGrade, string> = {
  [MembershipGrade.BRONZE]: '브론즈',
  [MembershipGrade.SILVER]: '실버',
  [MembershipGrade.GOLD]: '골드',
  [MembershipGrade.VIP]: 'VIP',
};

export class RealProfileRepository implements ProfileRepository {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const userRepository = AppDataSource.getRepository(User);
    
    const user = await userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      return null;
    }

    const pointWalletRepository = AppDataSource.getRepository(PointWallet);
    const couponIssuanceRepository = AppDataSource.getRepository(CouponIssuance);
    const wishlistItemRepository = AppDataSource.getRepository(WishlistItem);
    const orderItemRepository = AppDataSource.getRepository(OrderItem);

    const [pointWallet, couponCount, favoriteCount, pendingReviewCount] = await Promise.all([
      pointWalletRepository.findOne({ where: { userId } }),
      couponIssuanceRepository.count({ where: { userId, isUsed: false } }),
      wishlistItemRepository
        .createQueryBuilder('item')
        .innerJoin('item.wishlist', 'wishlist')
        .where('wishlist.userId = :userId', { userId })
        .getCount(),
      orderItemRepository
        .createQueryBuilder('orderItem')
        .innerJoin('orderItem.order', 'order')
        .where('order.userId = :userId', { userId })
        .andWhere('order.status = :status', { status: 'delivered' })
        .andWhere('orderItem.isReviewed = :isReviewed', { isReviewed: false })
        .getCount(),
    ]);

    return {
      id: user.id,
      name: user.name,
      grade: GRADE_DISPLAY_MAP[user.membershipGrade] || '브론즈',
      points: pointWallet?.balance || 0,
      couponCount,
      favoriteCount,
      pendingReviewCount,
    };
  }

  async getRecentOrders(userId: string, limit: number): Promise<Order[]> {
    const orderRepository = AppDataSource.getRepository(OrderEntity);
    
    const orders = await orderRepository.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      orderDate: this.formatDate(order.createdAt),
      status: order.status as any,
      statusDate: this.formatStatusDate(order.updatedAt),
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId || '',
        productName: item.productName,
        imageUrl: item.productImageUrl || 'https://placehold.co/62x62/f5f5f5/999999?text=Product',
        quantity: item.quantity,
        price: item.unitPrice,
      })),
    }));
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  }

  private formatStatusDate(date: Date): string {
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  }
}
