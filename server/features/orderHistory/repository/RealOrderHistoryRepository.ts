import { OrderHistoryRepository } from './OrderHistoryRepository';
import { OrderHistoryEntry, OrderStatusFilter } from '../domain/OrderHistory';
import { AppDataSource } from '../../../config/database';
import { Order, OrderStatus } from '../../../entity/Order';
import { In } from 'typeorm';

const STATUS_LABEL_MAP: Record<OrderStatus, string> = {
  pending: '결제대기',
  paid: '결제완료',
  preparing: '상품준비중',
  shipping: '배송중',
  delivered: '배송완료',
  cancelled: '주문취소',
  refund_requested: '환불요청',
  refunded: '환불완료',
};

const STATUS_FILTER_MAP: Record<OrderStatusFilter, OrderStatus[]> = {
  all: ['pending', 'paid', 'preparing', 'shipping', 'delivered', 'cancelled', 'refund_requested', 'refunded'],
  shipping: ['pending', 'paid', 'preparing', 'shipping'],
  delivered: ['delivered'],
  cancelled: ['cancelled', 'refund_requested', 'refunded'],
};

export class RealOrderHistoryRepository implements OrderHistoryRepository {
  async getOrderHistory(userId: string, statusFilter: OrderStatusFilter): Promise<OrderHistoryEntry[]> {
    const orderRepository = AppDataSource.getRepository(Order);
    
    const statuses = STATUS_FILTER_MAP[statusFilter];
    
    const orders = await orderRepository.find({
      where: {
        userId,
        status: In(statuses),
      },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });

    return orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      orderDate: this.formatDate(order.createdAt),
      status: order.status,
      statusLabel: STATUS_LABEL_MAP[order.status] || order.status,
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
