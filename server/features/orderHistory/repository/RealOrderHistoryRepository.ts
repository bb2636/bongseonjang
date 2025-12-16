import { OrderHistoryRepository } from './OrderHistoryRepository';
import {
  OrderHistoryEntry,
  OrderStatusFilter,
  OrderDetail,
  PaymentInfo,
  ShipmentSummary,
  UnifiedOrderStatus,
} from '../domain/OrderHistory';
import { AppDataSource } from '../../../config/database';
import { Order, OrderStatus } from '../../../entity/Order';
import { Payment, PaymentMethod } from '../../../entity/Payment';
import { In } from 'typeorm';
import { Shipment, ShipmentStatus } from '../../../entity/Shipment';

const STATUS_FILTER_MAP: Record<OrderStatusFilter, OrderStatus[]> = {
  all: ['pending', 'paid', 'preparing', 'shipping', 'delivered', 'cancelled', 'refund_requested', 'refunded'],
  shipping: ['pending', 'paid', 'preparing', 'shipping'],
  delivered: ['delivered'],
  cancelled: ['cancelled', 'refund_requested', 'refunded'],
};

const ORDER_STATUS_MAP: Record<OrderStatus, UnifiedOrderStatus> = {
  pending: 'pending',
  paid: 'confirmed',
  preparing: 'confirmed',
  shipping: 'shipping',
  delivered: 'delivered',
  cancelled: 'cancelled',
  refund_requested: 'cancelled',
  refunded: 'cancelled',
};

const SHIPMENT_STATUS_MAP: Record<ShipmentStatus, UnifiedOrderStatus> = {
  pending: 'pending',
  picked_up: 'shipping',
  in_transit: 'shipping',
  out_for_delivery: 'shipping',
  delivered: 'delivered',
  failed: 'cancelled',
  returned: 'cancelled',
};

const UNIFIED_STATUS_LABELS: Record<UnifiedOrderStatus, string> = {
  pending: '결제 대기',
  confirmed: '주문 확정',
  shipping: '배송중',
  delivered: '배송완료',
  cancelled: '취소됨',
};

export class RealOrderHistoryRepository implements OrderHistoryRepository {
  async getOrderHistory(userId: string, statusFilter: OrderStatusFilter): Promise<OrderHistoryEntry[]> {
    const orderRepository = AppDataSource.getRepository(Order);
    const shipmentRepository = AppDataSource.getRepository(Shipment);

    const statuses = STATUS_FILTER_MAP[statusFilter];

    const orders = await orderRepository.find({
      where: {
        userId,
        status: In(statuses),
      },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });

    if (orders.length === 0) {
      return [];
    }

    const shipments = await shipmentRepository.find({
      where: { orderId: In(orders.map(order => order.id)) },
      order: { shippedAt: 'DESC', createdAt: 'DESC' },
    });

    const shipmentMap = this.groupShipmentsByOrder(shipments);

    return orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      orderDate: this.formatDate(order.createdAt),
      status: ORDER_STATUS_MAP[order.status],
      statusLabel: UNIFIED_STATUS_LABELS[ORDER_STATUS_MAP[order.status]],
      statusDate: this.formatStatusDate(order.updatedAt),
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productImageUrl: item.productImageUrl || 'https://placehold.co/62x62/f5f5f5/999999?text=Product',
        mainOptionName: item.mainOptionName,
        subOptionName: item.subOptionName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      totalAmount: order.finalAmount,
      shipment: this.getLatestShipment(shipmentMap.get(order.id)),
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

  private formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  }

  private groupShipmentsByOrder(shipments: Shipment[]): Map<string, Shipment[]> {
    return shipments.reduce<Map<string, Shipment[]>>((map, shipment) => {
      const existingShipments = map.get(shipment.orderId) || [];
      return map.set(shipment.orderId, [...existingShipments, shipment]);
    }, new Map());
  }

  private getLatestShipment(shipments: Shipment[] | undefined): ShipmentSummary | null {
    if (!shipments || shipments.length === 0) {
      return null;
    }

    return this.mapShipment(shipments[0]);
  }

  private mapShipments(shipments: Shipment[]): ShipmentSummary[] {
    return shipments.map(shipment => this.mapShipment(shipment));
  }

  private mapShipment(shipment: Shipment): ShipmentSummary {
    const status = SHIPMENT_STATUS_MAP[shipment.status];

    return {
      id: shipment.id,
      carrier: shipment.carrier ?? shipment.carrierName ?? shipment.carrierCode,
      trackingNumber: shipment.trackingNumber,
      shippedAt: shipment.shippedAt ? this.formatDateTime(shipment.shippedAt) : null,
      status,
      statusLabel: UNIFIED_STATUS_LABELS[status],
    };
  }

  async getOrderDetail(orderId: string, userId: string): Promise<OrderDetail | null> {
    const orderRepository = AppDataSource.getRepository(Order);
    const paymentRepository = AppDataSource.getRepository(Payment);
    const shipmentRepository = AppDataSource.getRepository(Shipment);

    const order = await orderRepository.findOne({
      where: { id: orderId, userId },
      relations: ['items'],
    });

    if (!order) {
      return null;
    }

    const payment = await paymentRepository.findOne({
      where: { orderId: order.id },
      order: { createdAt: 'DESC' },
    });

    const paymentMethodLabelMap: Record<PaymentMethod, string> = {
      card: '신용카드',
      bank_transfer: '계좌이체',
      virtual_account: '무통장입금',
      mobile: '휴대폰결제',
      kakao_pay: '카카오페이',
      naver_pay: '네이버페이',
      toss_pay: '토스페이',
    };

    let paymentInfo: PaymentInfo | null = null;
    if (payment) {
      paymentInfo = {
        method: payment.method,
        methodLabel: paymentMethodLabelMap[payment.method] || payment.method,
        cardCompany: payment.cardCompany,
        cardNumber: payment.cardNumber,
        installmentMonths: payment.installmentMonths,
        paidAt: payment.paidAt ? this.formatDateTime(payment.paidAt) : null,
      };
    }

    const shipments = await shipmentRepository.find({
      where: { orderId: order.id },
      order: { shippedAt: 'DESC', createdAt: 'DESC' },
    });

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      orderDate: this.formatDate(order.createdAt),
      status: ORDER_STATUS_MAP[order.status],
      statusLabel: UNIFIED_STATUS_LABELS[ORDER_STATUS_MAP[order.status]],
      recipientName: order.recipientName,
      recipientPhone: order.recipientPhone,
      postalCode: order.postalCode,
      address: order.address,
      addressDetail: order.addressDetail,
      deliveryRequest: order.deliveryRequest,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productImageUrl: item.productImageUrl || 'https://placehold.co/62x62/f5f5f5/999999?text=Product',
        mainOptionName: item.mainOptionName,
        subOptionName: item.subOptionName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      totalProductPrice: order.totalProductPrice,
      usedPoints: order.usedPoints,
      couponDiscountAmount: order.couponDiscountAmount,
      shippingFee: 0,
      finalAmount: order.finalAmount,
      payment: paymentInfo,
      paidAt: order.paidAt ? this.formatDateTime(order.paidAt) : null,
      shipments: this.mapShipments(shipments),
    };
  }

  async hasPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    const orderRepository = AppDataSource.getRepository(Order);
    
    const completedStatuses: OrderStatus[] = ['paid', 'preparing', 'shipping', 'delivered'];
    
    const order = await orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.items', 'item')
      .where('order.userId = :userId', { userId })
      .andWhere('order.status IN (:...statuses)', { statuses: completedStatuses })
      .andWhere('item.productId = :productId', { productId })
      .getOne();

    return !!order;
  }
}
