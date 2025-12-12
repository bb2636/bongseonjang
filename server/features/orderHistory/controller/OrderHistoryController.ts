import { Response } from 'express';
import { OrderHistoryService } from '../application/OrderHistoryService';
import { AuthenticatedRequest } from '../../../common/middleware/authMiddleware';
import { OrderStatusFilter } from '../domain/OrderHistory';

const VALID_STATUS_FILTERS: OrderStatusFilter[] = ['all', 'shipping', 'delivered', 'cancelled'];

export class OrderHistoryController {
  constructor(private readonly orderHistoryService: OrderHistoryService) {}

  async getOrderHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const statusParam = req.query.status as string || 'all';
      const statusFilter: OrderStatusFilter = VALID_STATUS_FILTERS.includes(statusParam as OrderStatusFilter)
        ? (statusParam as OrderStatusFilter)
        : 'all';

      const result = await this.orderHistoryService.getOrderHistory(userId, statusFilter);
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching order history:', error);
      res.status(500).json({ error: 'Failed to fetch order history' });
    }
  }
}
