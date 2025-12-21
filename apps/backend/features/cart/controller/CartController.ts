import { Response } from 'express';
import { CartService } from '../application/CartService.js';
import { AuthenticatedRequest } from '../../../common/middleware/authMiddleware.js';
import { AddToCartRequest, UpdateCartItemRequest } from '@bongkru/contract';

export class CartController {
  constructor(private readonly cartService: CartService) {}

  async getCart(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const cart = await this.cartService.getCart(userId);
      res.json(cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ error: 'Failed to fetch cart' });
    }
  }

  async addItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { productId, productOptionId, quantity } = req.body;

      console.log('[Cart] Add item request:', { productId, productOptionId, quantity, userId });

      if (!productId) {
        console.error('[Cart] Product ID is missing in request body:', req.body);
        res.status(400).json({ error: 'Product ID is required' });
        return;
      }

      const item = await this.cartService.addItem(
        userId,
        productId,
        productOptionId ?? null,
        quantity ?? 1
      );

      res.status(201).json(item);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      res.status(500).json({ error: 'Failed to add item to cart' });
    }
  }

  async updateItemQuantity(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { itemId } = req.params;
      const { quantity } = req.body;

      if (typeof quantity !== 'number') {
        res.status(400).json({ error: 'Quantity is required' });
        return;
      }

      const item = await this.cartService.updateItemQuantity(userId, itemId, quantity);

      if (quantity <= 0) {
        res.status(204).send();
        return;
      }

      if (!item) {
        res.status(404).json({ error: 'Cart item not found' });
        return;
      }

      res.json(item);
    } catch (error) {
      console.error('Error updating cart item:', error);
      res.status(500).json({ error: 'Failed to update cart item' });
    }
  }

  async removeItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { itemId } = req.params;
      const removed = await this.cartService.removeItem(userId, itemId);

      if (!removed) {
        res.status(404).json({ error: 'Cart item not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error removing cart item:', error);
      res.status(500).json({ error: 'Failed to remove cart item' });
    }
  }

  async removeItems(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { itemIds } = req.body;

      if (!Array.isArray(itemIds) || itemIds.length === 0) {
        res.status(400).json({ error: 'Item IDs array is required' });
        return;
      }

      const removedCount = await this.cartService.removeItems(userId, itemIds);
      res.json({ removedCount });
    } catch (error) {
      console.error('Error removing cart items:', error);
      res.status(500).json({ error: 'Failed to remove cart items' });
    }
  }

  async clearCart(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await this.cartService.clearCart(userId);
      res.status(204).send();
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({ error: 'Failed to clear cart' });
    }
  }

  async mergeGuestCart(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { items } = req.body;

      if (!Array.isArray(items)) {
        res.status(400).json({ error: 'Items array is required' });
        return;
      }

      let mergedCount = 0;
      for (const item of items) {
        if (item.productId) {
          try {
            await this.cartService.addItem(
              userId,
              item.productId,
              item.optionId ?? null,
              item.quantity ?? 1
            );
            mergedCount++;
          } catch (err) {
            console.error('Error merging cart item:', err);
          }
        }
      }

      res.json({ mergedCount });
    } catch (error) {
      console.error('Error merging guest cart:', error);
      res.status(500).json({ error: 'Failed to merge guest cart' });
    }
  }
}
