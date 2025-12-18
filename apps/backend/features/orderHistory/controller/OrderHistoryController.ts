import { Response } from 'express';
import { OrderHistoryService } from '../application/OrderHistoryService.js';
import { AuthenticatedRequest } from '../../../common/middleware/authMiddleware.js';
import { OrderStatusFilter } from '../domain/OrderHistory.js';

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

  async getOrderDetail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const orderId = req.params.orderId;
      
      if (!orderId) {
        res.status(400).json({ error: 'Order ID is required' });
        return;
      }

      const result = await this.orderHistoryService.getOrderDetail(orderId, userId);
      
      if (!result) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      res.json(result);
    } catch (error) {
      console.error('Error fetching order detail:', error);
      res.status(500).json({ error: 'Failed to fetch order detail' });
    }
  }

  async checkPurchase(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { productId } = req.params;
      
      if (!productId) {
        res.status(400).json({ error: 'Product ID is required' });
        return;
      }

      const hasPurchased = await this.orderHistoryService.hasPurchasedProduct(userId, productId);
      
      res.json({ hasPurchased });
    } catch (error) {
      console.error('Error checking purchase:', error);
      res.status(500).json({ error: 'Failed to check purchase' });
    }
  }
}
