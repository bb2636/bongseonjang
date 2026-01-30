import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Order } from '../../../entity/Order';
import { User } from '../../../entity/User';
import { Payment } from '../../../entity/Payment';
import { Shipment } from '../../../entity/Shipment';
import { OrderItem } from '../../../entity/OrderItem';
import { Product } from '../../../entity/Product';
import { ProductOption } from '../../../entity/ProductOption';
import { PointRepository } from '../../point/repository/PointRepository';
import { CouponRepository } from '../../coupon/repository/CouponRepository';

const router = Router();

type FrontendOrderStatus =
  | 'PAYMENT_PENDING'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_COMPLETED'
  | 'PREPARING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

type FrontendPaymentMethod =
  | 'CARD'
  | 'ACCOUNT_TRANSFER'
  | 'BANK_TRANSFER';

interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  orderedAt: string;
  orderStatus: FrontendOrderStatus;
  customerName: string;
  phoneNumber: string;
  email: string;
  totalAmount: number;
  paymentMethod: FrontendPaymentMethod | null;
  shippingCompany: string | null;
  trackingNumber: string | null;
}

const dbStatusToFrontend: Record<string, FrontendOrderStatus> = {
  pending: 'PAYMENT_PENDING',
  payment_failed: 'PAYMENT_FAILED',
  paid: 'PAYMENT_COMPLETED',
  preparing: 'PREPARING',
  shipping: 'SHIPPING',
  delivered: 'DELIVERED',
  cancelled: 'CANCELLED',
  refund_requested: 'CANCELLED',
  refunded: 'CANCELLED',
};

const dbPaymentMethodToFrontend: Record<string, FrontendPaymentMethod> = {
  card: 'CARD',
  CARD: 'CARD',
  bank_transfer: 'BANK_TRANSFER',
  BANK_TRANSFER: 'BANK_TRANSFER',
  virtual_account: 'ACCOUNT_TRANSFER',
  ACCOUNT_TRANSFER: 'ACCOUNT_TRANSFER',
  mobile: 'CARD',
  toss_pay: 'CARD',
};

const frontendToDbPaymentMethods: Record<string, string[]> = {
  CARD: ['card', 'CARD', 'mobile', 'toss_pay'],
  ACCOUNT_TRANSFER: ['virtual_account', 'ACCOUNT_TRANSFER'],
  BANK_TRANSFER: ['bank_transfer', 'BANK_TRANSFER'],
};

function formatDate(date: Date): string {
  const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
  const year = kstDate.getUTCFullYear();
  const month = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(kstDate.getUTCDate()).padStart(2, '0');
  const hours = String(kstDate.getUTCHours()).padStart(2, '0');
  const minutes = String(kstDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(kstDate.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, status, paymentMethod, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    const orderRepository = AppDataSource.getRepository(Order);

    let queryBuilder = orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoin(Payment, 'payment', 'payment.orderId = order.id')
      .leftJoin(Shipment, 'shipment', 'shipment.orderId = order.id')
      .addSelect([
        'payment.method',
        'shipment.carrierName',
        'shipment.trackingNumber',
      ]);

    if (status && status !== 'ALL') {
      const frontendToDbStatus: Record<string, string[]> = {
        PAYMENT_PENDING: ['pending'],
        PAYMENT_FAILED: ['payment_failed'],
        PAYMENT_COMPLETED: ['paid'],
        PREPARING: ['preparing'],
        SHIPPING: ['shipping'],
        DELIVERED: ['delivered'],
        CANCELLED: ['cancelled', 'refund_requested', 'refunded'],
      };
      const dbStatuses = frontendToDbStatus[status as string] || [];
      if (dbStatuses.length > 0) {
        queryBuilder = queryBuilder.andWhere('order.status IN (:...statuses)', { statuses: dbStatuses });
      }
    }

    if (paymentMethod && paymentMethod !== 'ALL') {
      const dbMethods = frontendToDbPaymentMethods[paymentMethod as string] || [];
      if (dbMethods.length > 0) {
        queryBuilder = queryBuilder.andWhere('payment.method IN (:...methods)', { methods: dbMethods });
      }
    }

    if (search && typeof search === 'string' && search.trim()) {
      const keyword = search.trim();
      queryBuilder = queryBuilder.andWhere(
        '(order.orderNumber ILIKE :keyword OR order.recipientName ILIKE :keyword OR order.recipientPhone ILIKE :keyword OR user.email ILIKE :keyword OR user.name ILIKE :keyword)',
        { keyword: `%${keyword}%` }
      );
    }

    const totalCount = await queryBuilder.getCount();

    const rawOrders = await queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip(offset)
      .take(limitNum)
      .getRawAndEntities();

    const orders = rawOrders.entities;
    const rawData = rawOrders.raw;

    const items: AdminOrderListItem[] = orders.map((order, index) => {
      const raw = rawData[index];
      const user = order.user;

      let frontendPaymentMethod: FrontendPaymentMethod | null = null;
      const paymentMethodValue = raw.payment_method;
      if (paymentMethodValue) {
        frontendPaymentMethod = dbPaymentMethodToFrontend[paymentMethodValue] || null;
      }

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        orderedAt: formatDate(order.createdAt),
        orderStatus: dbStatusToFrontend[order.status] || 'PAYMENT_PENDING',
        customerName: user?.name || order.recipientName || '알 수 없음',
        phoneNumber: user?.phone || order.recipientPhone || '-',
        email: user?.email || '-',
        totalAmount: order.finalAmount,
        paymentMethod: frontendPaymentMethod,
        shippingCompany: raw.shipment_carrierName || null,
        trackingNumber: raw.shipment_trackingNumber || null,
      };
    });

    const totalPages = Math.ceil(totalCount / limitNum);

    return res.json({
      items,
      totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages,
    });
  } catch (error) {
    console.error('Failed to get admin orders:', error);
    return res.status(500).json({ error: '주문 목록을 불러오는데 실패했습니다' });
  }
});

router.put('/:orderId/shipping', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { carrierId, carrierName, trackingNumber } = req.body;

    if (!carrierId || !carrierName) {
      return res.status(400).json({ error: '택배사를 선택해주세요' });
    }

    const orderRepository = AppDataSource.getRepository(Order);
    const shipmentRepository = AppDataSource.getRepository(Shipment);

    const order = await orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다' });
    }

    let shipment = await shipmentRepository.findOne({ where: { orderId } });
    const hasTrackingNumber = trackingNumber && trackingNumber.trim() !== '';
    
    if (shipment) {
      shipment.carrierCode = carrierId;
      shipment.carrierName = carrierName;
      if (hasTrackingNumber) {
        shipment.trackingNumber = trackingNumber;
        shipment.status = 'in_transit';
      }
      await shipmentRepository.save(shipment);
    } else {
      shipment = shipmentRepository.create({
        orderId,
        carrierCode: carrierId,
        carrierName: carrierName,
        trackingNumber: hasTrackingNumber ? trackingNumber : null,
        status: hasTrackingNumber ? 'in_transit' : 'pending',
      });
      await shipmentRepository.save(shipment);
    }

    if (hasTrackingNumber && (order.status === 'paid' || order.status === 'preparing')) {
      order.status = 'shipping';
      await orderRepository.save(order);
    }

    return res.json({
      success: true,
      message: hasTrackingNumber ? '배송 정보가 저장되었습니다' : '택배사가 저장되었습니다',
      shipment: {
        carrierName: shipment.carrierName,
        trackingNumber: shipment.trackingNumber,
      },
    });
  } catch (error) {
    console.error('Failed to update shipping info:', error);
    return res.status(500).json({ error: '배송 정보 저장에 실패했습니다' });
  }
});

router.put('/:orderId/status', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'paid', 'preparing', 'shipping', 'delivered', 'cancelled', 'refunded', 'payment_failed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: '유효하지 않은 주문 상태입니다' });
    }

    const orderRepository = AppDataSource.getRepository(Order);
    const order = await orderRepository.findOne({ where: { id: orderId } });
    
    if (!order) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다' });
    }

    const previousStatus = order.status;
    const isCancelOrRefund = status === 'cancelled' || status === 'refunded';
    const wasAlreadyCancelledOrRefunded = previousStatus === 'cancelled' || previousStatus === 'refunded';
    const wasPaidOrAfter = ['paid', 'preparing', 'shipping', 'delivered'].includes(previousStatus);
    const shouldRestore = isCancelOrRefund && !wasAlreadyCancelledOrRefunded && wasPaidOrAfter;

    if (shouldRestore) {
      await AppDataSource.transaction(async (manager) => {
        const orderItemRepo = manager.getRepository(OrderItem);
        const productRepo = manager.getRepository(Product);
        const productOptionRepo = manager.getRepository(ProductOption);

        const orderItems = await orderItemRepo.find({ where: { orderId: order.id } });
        for (const item of orderItems) {
          if (item.productId) {
            await productRepo.increment(
              { id: item.productId },
              'stockQuantity',
              item.quantity
            );
          }
          if (item.productOptionId) {
            await productOptionRepo.increment(
              { id: item.productOptionId },
              'stockQuantity',
              item.quantity
            );
          }
        }

        if (order.usedPoints > 0 && order.userId) {
          const pointRepository = new PointRepository();
          const wallet = await pointRepository.findWalletByUserId(order.userId);
          if (wallet) {
            await pointRepository.cancelPoints(
              wallet.id,
              order.usedPoints,
              `주문 취소로 인한 포인트 복원 (${order.orderNumber})`,
              order.id
            );
          }
        }

        const couponRepository = new CouponRepository();
        if (order.userCouponIdsJson) {
          try {
            const couponIds: number[] = JSON.parse(order.userCouponIdsJson);
            for (const couponId of couponIds) {
              await couponRepository.restoreUserCoupon(couponId);
            }
          } catch (e) {
            console.error('Failed to parse userCouponIdsJson:', e);
          }
        } else if (order.userCouponId) {
          await couponRepository.restoreUserCoupon(order.userCouponId);
        }

        order.status = status;
        await manager.save(order);
      });
    } else {
      order.status = status;
      if (status === 'delivered') {
        order.deliveredAt = new Date();
      }
      await orderRepository.save(order);
    }

    return res.json({
      success: true,
      message: '주문 상태가 변경되었습니다',
      order: {
        id: order.id,
        status: order.status,
      },
    });
  } catch (error) {
    console.error('Failed to update order status:', error);
    return res.status(500).json({ error: '주문 상태 변경에 실패했습니다' });
  }
});

export { router as adminOrderRoutes };
