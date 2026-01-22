import { ProfileRepository, UpdateProfileData } from './ProfileRepository';
import { UserProfile, Order } from '../domain/Profile';
import { AppDataSource } from '../../../config/database';
import { User, MembershipGrade } from '../../../entity/User';
import { PointWallet } from '../../../entity/PointWallet';
import { UserCoupon } from '../../../entity/UserCoupon';
import { WishlistItem } from '../../../entity/WishlistItem';
import { OrderItem } from '../../../entity/OrderItem';
import { Order as OrderEntity } from '../../../entity/Order';
import { Review } from '../../../entity/Review';
import { Product } from '../../../entity/Product';
import { In } from 'typeorm';
import { toAbsoluteImageUrl } from '../../../common/utils/imageUrl.js';

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
    const userCouponRepository = AppDataSource.getRepository(UserCoupon);
    const wishlistItemRepository = AppDataSource.getRepository(WishlistItem);
    const orderItemRepository = AppDataSource.getRepository(OrderItem);

    const pendingReviewQuery = orderItemRepository
      .createQueryBuilder('orderItem')
      .innerJoin('orderItem.order', 'order')
      .select('COUNT(DISTINCT orderItem.productId)', 'count')
      .where('order.userId = :userId', { userId })
      .andWhere('order.status = :status', { status: 'delivered' })
      .andWhere('orderItem.productId IS NOT NULL')
      .andWhere(qb => {
        const subQuery = qb.subQuery()
          .select('1')
          .from(Review, 'review')
          .where('review.userId = :userId')
          .andWhere('review.productId IS NOT NULL')
          .andWhere('review.productId = orderItem.productId')
          .getQuery();
        return `NOT EXISTS ${subQuery}`;
      });

    const now = new Date();
    const [pointWallet, couponCount, favoriteCount, pendingReviewResult] = await Promise.all([
      pointWalletRepository.findOne({ where: { userId } }),
      userCouponRepository
        .createQueryBuilder('uc')
        .where('uc.userId = :userId', { userId })
        .andWhere('uc.status = :status', { status: 'ISSUED' })
        .andWhere('(uc.validTo IS NULL OR uc.validTo > :now)', { now })
        .getCount(),
      wishlistItemRepository
        .createQueryBuilder('item')
        .innerJoin('item.wishlist', 'wishlist')
        .where('wishlist.userId = :userId', { userId })
        .getCount(),
      pendingReviewQuery.getRawOne(),
    ]);

    const pendingReviewCount = parseInt(pendingReviewResult?.count || '0', 10);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      birthDate: user.birthDate ? this.formatBirthDate(user.birthDate) : null,
      gender: user.gender,
      isMarketingEmail: user.isMarketingEmail ?? false,
      isMarketingSms: user.isMarketingSms ?? false,
      grade: GRADE_DISPLAY_MAP[user.membershipGrade] || '브론즈',
      points: pointWallet?.balance || 0,
      couponCount,
      favoriteCount,
      pendingReviewCount,
    };
  }

  async getRecentOrders(userId: string, limit: number, onlyInProgress: boolean = false): Promise<Order[]> {
    const orderRepository = AppDataSource.getRepository(OrderEntity);
    const productRepository = AppDataSource.getRepository(Product);
    
    const inProgressStatuses = ['pending', 'paid', 'confirmed', 'preparing', 'shipping'];
    
    let queryBuilder = orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.userId = :userId', { userId });
    
    if (onlyInProgress) {
      queryBuilder = queryBuilder.andWhere('order.status IN (:...statuses)', { statuses: inProgressStatuses });
    }
    
    const orders = await queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .take(limit)
      .getMany();

    const allProductIds = orders
      .flatMap(order => order.items)
      .map(item => item.productId)
      .filter((id): id is string => id !== null);

    const uniqueProductIds = [...new Set(allProductIds)];
    const productAvailabilityMap = new Map<string, boolean>();

    if (uniqueProductIds.length > 0) {
      const products = await productRepository.find({
        where: { id: In(uniqueProductIds) },
        select: ['id', 'saleEndDate', 'stockQuantity'],
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const product of products) {
        let isAvailable = true;

        if (product.saleEndDate) {
          const saleEndDate = new Date(product.saleEndDate);
          saleEndDate.setHours(23, 59, 59, 999);
          if (saleEndDate < today) {
            isAvailable = false;
          }
        }

        if (product.stockQuantity === 0) {
          isAvailable = false;
        }

        productAvailabilityMap.set(product.id, isAvailable);
      }
    }

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
        imageUrl: toAbsoluteImageUrl(item.productImageUrl) || 'https://placehold.co/62x62/f5f5f5/999999?text=Product',
        quantity: item.quantity,
        price: item.unitPrice,
        isAvailableForReorder: item.productId ? (productAvailabilityMap.get(item.productId) ?? false) : false,
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

  private formatBirthDate(date: Date | string): string {
    if (typeof date === 'string') {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        const year = String(parsed.getFullYear());
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const day = String(parsed.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      return date;
    }
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async getUserPasswordHash(userId: string): Promise<string | null> {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ 
      where: { id: userId },
      select: ['id', 'password'] 
    });
    return user?.password || null;
  }

  async updateProfile(userId: string, data: UpdateProfileData): Promise<void> {
    const userRepository = AppDataSource.getRepository(User);
    
    const updateData: Partial<User> = {
      name: data.name,
    };

    if (data.phone !== undefined) {
      updateData.phone = data.phone;
    }
    if (data.birthDate !== undefined) {
      updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
    }
    if (data.gender !== undefined) {
      updateData.gender = data.gender;
    }
    if (data.isMarketingEmail !== undefined) {
      updateData.isMarketingEmail = data.isMarketingEmail;
    }
    if (data.isMarketingSms !== undefined) {
      updateData.isMarketingSms = data.isMarketingSms;
    }
    if (data.password !== undefined) {
      updateData.password = data.password;
    }

    await userRepository.update({ id: userId }, updateData);
  }

  async deleteUser(userId: string): Promise<void> {
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.delete({ id: userId });
  }
}
