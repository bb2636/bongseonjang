import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Cart } from '../../../entity/Cart';
import { CartItem } from '../../../entity/CartItem';
import { authMiddleware, AuthenticatedRequest } from '../../../common/middleware/authMiddleware';

const router = Router();

router.get('/count', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;

    const cartRepository = AppDataSource.getRepository(Cart);
    const cartItemRepository = AppDataSource.getRepository(CartItem);

    const cart = await cartRepository.findOne({
      where: { userId, isActive: true },
    });

    if (!cart) {
      return res.json({ count: 0 });
    }

    const count = await cartItemRepository
      .createQueryBuilder('item')
      .where('item.cartId = :cartId', { cartId: cart.id })
      .select('SUM(item.quantity)', 'total')
      .getRawOne();

    return res.json({ count: parseInt(count?.total || '0', 10) });
  } catch (error) {
    console.error('Failed to get cart count:', error);
    return res.status(500).json({ error: 'Failed to get cart count' });
  }
});

export { router as cartRoutes };
