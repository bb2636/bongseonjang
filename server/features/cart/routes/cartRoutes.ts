import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Cart } from '../../../entity/Cart';
import { CartItem } from '../../../entity/CartItem';
import { authMiddleware, AuthenticatedRequest } from '../../../common/middleware/authMiddleware';

const router = Router();

router.post('/items', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;
    const { productId, items } = req.body;

    if (!productId || typeof productId !== 'string') {
      return res.status(400).json({ error: '유효한 productId가 필요합니다' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items 배열이 필요합니다' });
    }

    for (const item of items) {
      const qty = item.quantity;
      if (qty !== undefined && (typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1)) {
        return res.status(400).json({ error: '수량은 1 이상의 정수여야 합니다' });
      }
    }

    const { Product } = await import('../../../entity/Product');
    const { ProductMainOption } = await import('../../../entity/ProductMainOption');
    const { ProductSubOption } = await import('../../../entity/ProductSubOption');

    const productRepository = AppDataSource.getRepository(Product);
    const mainOptionRepository = AppDataSource.getRepository(ProductMainOption);
    const subOptionRepository = AppDataSource.getRepository(ProductSubOption);

    const product = await productRepository.findOne({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다' });
    }

    for (const item of items) {
      if (item.mainOptionId) {
        const mainOption = await mainOptionRepository.findOne({ 
          where: { id: item.mainOptionId, productId } 
        });
        if (!mainOption) {
          return res.status(400).json({ error: '유효하지 않은 메인 옵션입니다' });
        }
      }
      if (item.subOptionId) {
        const subOption = await subOptionRepository.findOne({ 
          where: { id: item.subOptionId, productId } 
        });
        if (!subOption) {
          return res.status(400).json({ error: '유효하지 않은 서브 옵션입니다' });
        }
      }
    }

    const cartRepository = AppDataSource.getRepository(Cart);
    const cartItemRepository = AppDataSource.getRepository(CartItem);

    let cart = await cartRepository.findOne({
      where: { userId, isActive: true },
    });

    if (!cart) {
      cart = cartRepository.create({
        userId,
        isActive: true,
      });
      await cartRepository.save(cart);
    }

    for (const item of items) {
      const { mainOptionId, subOptionId, quantity } = item;
      const validQuantity = Math.max(1, Math.floor(quantity || 1));

      const existingItem = await cartItemRepository.findOne({
        where: {
          cartId: cart.id,
          productId,
          mainOptionId: mainOptionId || null,
          subOptionId: subOptionId || null,
        },
      });

      if (existingItem) {
        existingItem.quantity += validQuantity;
        await cartItemRepository.save(existingItem);
      } else {
        const newItem = cartItemRepository.create({
          cartId: cart.id,
          productId,
          mainOptionId: mainOptionId || null,
          subOptionId: subOptionId || null,
          quantity: validQuantity,
        });
        await cartItemRepository.save(newItem);
      }
    }

    return res.json({ success: true, message: '장바구니에 추가되었습니다' });
  } catch (error) {
    console.error('Failed to add to cart:', error);
    return res.status(500).json({ error: '장바구니 추가에 실패했습니다' });
  }
});

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
