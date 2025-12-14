import { OrderHistoryRepository } from '../repository/OrderHistoryRepository';
import { OrderHistoryResponse, OrderStatusFilter, OrderDetail } from '../domain/OrderHistory';

export class OrderHistoryService {
  constructor(private readonly orderHistoryRepository: OrderHistoryRepository) {}

  async getOrderHistory(userId: string, statusFilter: OrderStatusFilter): Promise<OrderHistoryResponse> {
    const orders = await this.orderHistoryRepository.getOrderHistory(userId, statusFilter);
    
    return {
      orders,
      totalCount: orders.length,
    };
  }

  async getOrderDetail(orderId: string, userId: string): Promise<OrderDetail | null> {
    return this.orderHistoryRepository.getOrderDetail(orderId, userId);
  }

  async hasPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    return this.orderHistoryRepository.hasPurchasedProduct(userId, productId);
  }
}
