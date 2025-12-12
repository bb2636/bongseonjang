import { OrderHistoryEntry, OrderStatusFilter } from '../domain/OrderHistory';

export interface OrderHistoryRepository {
  getOrderHistory(userId: string, statusFilter: OrderStatusFilter): Promise<OrderHistoryEntry[]>;
}
