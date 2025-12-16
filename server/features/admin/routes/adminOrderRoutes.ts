import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Order } from '../../../entity/Order';
import { User } from '../../../entity/User';
import { Payment } from '../../../entity/Payment';
import { Shipment } from '../../../entity/Shipment';

const router = Router();

type FrontendOrderStatus =
  | 'PAYMENT_PENDING'
  | 'PAYMENT_COMPLETED'
  | 'PREPARING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

type FrontendPaymentMethod =
  | 'CARD'
  | 'ACCOUNT_TRANSFER'
  | 'NAVER_PAY'
  | 'KAKAO_PAY';

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
  bank_transfer: 'ACCOUNT_TRANSFER',
  virtual_account: 'ACCOUNT_TRANSFER',
  mobile: 'CARD',
  kakao_pay: 'KAKAO_PAY',
  naver_pay: 'NAVER_PAY',
  toss_pay: 'CARD',
};

const frontendToDbPaymentMethods: Record<string, string[]> = {
  CARD: ['card', 'mobile', 'toss_pay'],
  ACCOUNT_TRANSFER: ['bank_transfer', 'virtual_account'],
  NAVER_PAY: ['naver_pay'],
  KAKAO_PAY: ['kakao_pay'],
};

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
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
        shippingCompany: raw.shipment_carrier_name || null,
        trackingNumber: raw.shipment_tracking_number || null,
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

export { router as adminOrderRoutes };
