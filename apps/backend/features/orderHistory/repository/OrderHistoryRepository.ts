import { OrderHistoryEntry, OrderStatusFilter, OrderDetail } from '../domain/OrderHistory';

export interface OrderHistoryRepository {
  getOrderHistory(userId: string, statusFilter: OrderStatusFilter): Promise<OrderHistoryEntry[]>;
  getOrderDetail(orderId: string, userId: string): Promise<OrderDetail | null>;
  hasPurchasedProduct(userId: string, productId: string): Promise<boolean>;
}
