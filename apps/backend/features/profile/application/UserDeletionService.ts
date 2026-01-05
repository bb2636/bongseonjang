import { DataSource, In } from 'typeorm';
import {
  User,
  UserSocialAccount,
  ShippingAddress,
  Cart,
  CartItem,
  Wishlist,
  WishlistItem,
  Order,
  OrderItem,
  OrderStatusHistory,
  Shipment,
  ShipmentEvent,
  Payment,
  PaymentRefund,
  PointWallet,
  PointTransaction,
  UserCoupon,
  SupportTicket,
  SupportMessage,
  ProductInquiry,
  Review,
  EmailVerificationToken,
  GuestOrderDetail,
} from '../../../entity/index.js';
import { ReviewImage } from '../../../entity/ReviewImage.js';
import { ObjectStorageService } from '../../../objectStorage.js';

export class UserDeletionService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly objectStorageService: ObjectStorageService
  ) {}

  async deleteAllUserData(userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepo = queryRunner.manager.getRepository(User);
      const user = await userRepo.findOne({ where: { id: userId } });
      
      if (!user) {
        throw new Error('User not found');
      }

      const userEmail = user.email;

      await this.deleteReviewsAndImages(queryRunner, userId);
      await this.deleteSupportData(queryRunner, userId);
      await this.deleteOrderRelatedData(queryRunner, userId);
      await this.deleteCartData(queryRunner, userId);
      await this.deleteWishlistData(queryRunner, userId);
      await this.deletePointData(queryRunner, userId);
      await this.deleteCouponData(queryRunner, userId);
      await this.deleteInquiryData(queryRunner, userId);
      await this.deleteAddressData(queryRunner, userId);
      await this.deleteSocialAccountData(queryRunner, userId);
      await this.deleteEmailVerificationData(queryRunner, userEmail);
      await this.deleteUserRecord(queryRunner, userId);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async deleteReviewsAndImages(queryRunner: any, userId: string): Promise<void> {
    const reviewRepo = queryRunner.manager.getRepository(Review);
    const reviewImageRepo = queryRunner.manager.getRepository(ReviewImage);
    
    const reviews = await reviewRepo.find({ where: { userId }, select: ['id'] });
    const reviewIds = reviews.map((r: { id: string }) => r.id);

    if (reviewIds.length > 0) {
      const reviewImages = await reviewImageRepo.find({ where: { reviewId: In(reviewIds) } });
      
      for (const image of reviewImages) {
        try {
          const objectPath = this.extractObjectPath(image.imageUrl);
          if (objectPath) {
            await this.objectStorageService.deleteObject(objectPath);
          }
        } catch (error) {
          console.error(`Failed to delete review image: ${image.imageUrl}`, error);
        }
      }

      await reviewImageRepo.delete({ reviewId: In(reviewIds) });
    }

    await reviewRepo.delete({ userId });
  }

  private async deleteSupportData(queryRunner: any, userId: string): Promise<void> {
    const ticketRepo = queryRunner.manager.getRepository(SupportTicket);
    const messageRepo = queryRunner.manager.getRepository(SupportMessage);

    const tickets = await ticketRepo.find({ where: { userId }, select: ['id'] });
    const ticketIds = tickets.map((t: { id: number }) => t.id);

    if (ticketIds.length > 0) {
      await messageRepo.delete({ ticketId: In(ticketIds) });
    }

    await ticketRepo.delete({ userId });
  }

  private async deleteOrderRelatedData(queryRunner: any, userId: string): Promise<void> {
    const orderRepo = queryRunner.manager.getRepository(Order);
    const orderItemRepo = queryRunner.manager.getRepository(OrderItem);
    const orderStatusHistoryRepo = queryRunner.manager.getRepository(OrderStatusHistory);
    const shipmentRepo = queryRunner.manager.getRepository(Shipment);
    const shipmentEventRepo = queryRunner.manager.getRepository(ShipmentEvent);
    const paymentRepo = queryRunner.manager.getRepository(Payment);
    const paymentRefundRepo = queryRunner.manager.getRepository(PaymentRefund);
    const guestOrderDetailRepo = queryRunner.manager.getRepository(GuestOrderDetail);

    const orders = await orderRepo.find({ where: { userId }, select: ['id'] });
    const orderIds = orders.map((o: { id: string }) => o.id);

    if (orderIds.length > 0) {
      const shipments = await shipmentRepo.find({ where: { orderId: In(orderIds) }, select: ['id'] });
      const shipmentIds = shipments.map((s: { id: number }) => s.id);

      if (shipmentIds.length > 0) {
        await shipmentEventRepo.delete({ shipmentId: In(shipmentIds) });
      }

      await shipmentRepo.delete({ orderId: In(orderIds) });

      const payments = await paymentRepo.find({ where: { orderId: In(orderIds) }, select: ['id'] });
      const paymentIds = payments.map((p: { id: string }) => p.id);

      if (paymentIds.length > 0) {
        await paymentRefundRepo.delete({ paymentId: In(paymentIds) });
      }

      await paymentRepo.delete({ orderId: In(orderIds) });

      await orderStatusHistoryRepo.delete({ orderId: In(orderIds) });

      await orderItemRepo.delete({ orderId: In(orderIds) });

      await guestOrderDetailRepo.delete({ orderId: In(orderIds) });
    }

    await orderRepo.delete({ userId });
  }

  private async deleteCartData(queryRunner: any, userId: string): Promise<void> {
    const cartRepo = queryRunner.manager.getRepository(Cart);
    const cartItemRepo = queryRunner.manager.getRepository(CartItem);

    const carts = await cartRepo.find({ where: { userId }, select: ['id'] });
    const cartIds = carts.map((c: { id: string }) => c.id);

    if (cartIds.length > 0) {
      await cartItemRepo.delete({ cartId: In(cartIds) });
    }

    await cartRepo.delete({ userId });
  }

  private async deleteWishlistData(queryRunner: any, userId: string): Promise<void> {
    const wishlistRepo = queryRunner.manager.getRepository(Wishlist);
    const wishlistItemRepo = queryRunner.manager.getRepository(WishlistItem);

    const wishlists = await wishlistRepo.find({ where: { userId }, select: ['id'] });
    const wishlistIds = wishlists.map((w: { id: string }) => w.id);

    if (wishlistIds.length > 0) {
      await wishlistItemRepo.delete({ wishlistId: In(wishlistIds) });
    }

    await wishlistRepo.delete({ userId });
  }

  private async deletePointData(queryRunner: any, userId: string): Promise<void> {
    const pointWalletRepo = queryRunner.manager.getRepository(PointWallet);
    const pointTransactionRepo = queryRunner.manager.getRepository(PointTransaction);

    const wallets = await pointWalletRepo.find({ where: { userId }, select: ['id'] });
    const walletIds = wallets.map((w: { id: number }) => w.id);

    if (walletIds.length > 0) {
      await pointTransactionRepo.delete({ walletId: In(walletIds) });
    }

    await pointWalletRepo.delete({ userId });
  }

  private async deleteCouponData(queryRunner: any, userId: string): Promise<void> {
    const userCouponRepo = queryRunner.manager.getRepository(UserCoupon);
    await userCouponRepo.delete({ userId });
  }

  private async deleteInquiryData(queryRunner: any, userId: string): Promise<void> {
    const inquiryRepo = queryRunner.manager.getRepository(ProductInquiry);
    
    const inquiries = await inquiryRepo.find({ where: { authorId: userId } });
    
    for (const inquiry of inquiries) {
      if (inquiry.imageUrls && inquiry.imageUrls.length > 0) {
        for (const imageUrl of inquiry.imageUrls) {
          try {
            const objectPath = this.extractObjectPath(imageUrl);
            if (objectPath) {
              await this.objectStorageService.deleteObject(objectPath);
            }
          } catch (error) {
            console.error(`Failed to delete inquiry image: ${imageUrl}`, error);
          }
        }
      }
    }

    await inquiryRepo.delete({ authorId: userId });
  }

  private async deleteAddressData(queryRunner: any, userId: string): Promise<void> {
    const addressRepo = queryRunner.manager.getRepository(ShippingAddress);
    await addressRepo.delete({ userId });
  }

  private async deleteSocialAccountData(queryRunner: any, userId: string): Promise<void> {
    const socialAccountRepo = queryRunner.manager.getRepository(UserSocialAccount);
    await socialAccountRepo.delete({ userId });
  }

  private async deleteEmailVerificationData(queryRunner: any, email: string): Promise<void> {
    const tokenRepo = queryRunner.manager.getRepository(EmailVerificationToken);
    await tokenRepo.delete({ email });
  }

  private async deleteUserRecord(queryRunner: any, userId: string): Promise<void> {
    const userRepo = queryRunner.manager.getRepository(User);
    await userRepo.delete({ id: userId });
  }

  private extractObjectPath(url: string): string | null {
    if (!url) return null;
    
    if (url.startsWith('/objects/')) {
      return url.replace('/objects/', '');
    }
    
    const objectsIndex = url.indexOf('/objects/');
    if (objectsIndex !== -1) {
      return url.substring(objectsIndex + '/objects/'.length);
    }
    
    return null;
  }
}
