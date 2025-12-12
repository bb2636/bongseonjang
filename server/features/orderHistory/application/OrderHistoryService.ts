import { OrderHistoryRepository } from '../repository/OrderHistoryRepository';
import { OrderHistoryResponse, OrderStatusFilter } from '../domain/OrderHistory';

export class OrderHistoryService {
  constructor(private readonly orderHistoryRepository: OrderHistoryRepository) {}

  async getOrderHistory(userId: string, statusFilter: OrderStatusFilter): Promise<OrderHistoryResponse> {
    const orders = await this.orderHistoryRepository.getOrderHistory(userId, statusFilter);
    
    return {
      orders,
      totalCount: orders.length,
    };
  }
}
