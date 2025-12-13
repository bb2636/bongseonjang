import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Cart } from '../../../entity/Cart';
import { CartItem } from '../../../entity/CartItem';
import { ProductImage } from '../../../entity/ProductImage';
import { authMiddleware, AuthenticatedRequest } from '../../../common/middleware/authMiddleware';
import { In } from 'typeorm';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;

    const cartRepository = AppDataSource.getRepository(Cart);
    const cartItemRepository = AppDataSource.getRepository(CartItem);
    const imageRepository = AppDataSource.getRepository(ProductImage);

    let cart = await cartRepository.findOne({
      where: { userId, isActive: true },
    });

    if (!cart) {
      cart = cartRepository.create({ userId, isActive: true });
      await cartRepository.save(cart);
    }

    const items = await cartItemRepository.find({
      where: { cartId: cart.id },
      relations: ['product', 'mainOption', 'subOption'],
      order: { createdAt: 'DESC' },
    });

    const productIds = items.map(item => item.productId);
    const thumbnailMap = new Map<string, string>();
    
    if (productIds.length > 0) {
      const thumbnails = await imageRepository.find({
        where: { productId: In(productIds), isThumbnail: true },
      });
      for (const img of thumbnails) {
        thumbnailMap.set(img.productId, img.imageUrl);
      }
    }

    const cartItems = items.map(item => {
      const basePrice = item.mainOption?.price ?? item.product?.basePrice ?? 0;
      const additionalPrice = item.subOption?.additionalPrice ?? 0;
      const unitPrice = basePrice + additionalPrice;
      const totalPrice = unitPrice * item.quantity;

      return {
        id: item.id,
        productId: item.productId,
        productName: item.product?.name ?? '',
        productImageUrl: thumbnailMap.get(item.productId) ?? 'https://placehold.co/58x58/f5f5f5/999999?text=No+Image',
        mainOptionId: item.mainOptionId,
        mainOptionName: item.mainOption?.name ?? null,
        subOptionId: item.subOptionId,
        subOptionName: item.subOption?.name ?? null,
        quantity: item.quantity,
        unitPrice,
        compareAtPrice: item.mainOption?.compareAtPrice ?? null,
        additionalPrice,
        totalPrice,
      };
    });

    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return res.json({
      id: cart.id,
      items: cartItems,
      subtotal,
      itemCount,
    });
  } catch (error) {
    console.error('Failed to get cart:', error);
    return res.status(500).json({ error: '장바구니 조회에 실패했습니다' });
  }
});

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

    const result = await cartItemRepository
      .createQueryBuilder('item')
      .select('SUM(item.quantity)', 'total')
      .where('item.cartId = :cartId', { cartId: cart.id })
      .getRawOne();

    const count = parseInt(result?.total || '0', 10);

    return res.json({ count });
  } catch (error) {
    console.error('Failed to get cart count:', error);
    return res.status(500).json({ error: 'Failed to get cart count' });
  }
});

router.patch('/items/:itemId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({ error: '유효한 수량을 입력해주세요' });
    }

    const cartRepository = AppDataSource.getRepository(Cart);
    const cartItemRepository = AppDataSource.getRepository(CartItem);

    const cart = await cartRepository.findOne({
      where: { userId, isActive: true },
    });

    if (!cart) {
      return res.status(404).json({ error: '장바구니를 찾을 수 없습니다' });
    }

    const item = await cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다' });
    }

    if (quantity === 0) {
      await cartItemRepository.remove(item);
      return res.status(204).send();
    }

    item.quantity = quantity;
    await cartItemRepository.save(item);

    return res.json({ success: true, quantity: item.quantity });
  } catch (error) {
    console.error('Failed to update cart item:', error);
    return res.status(500).json({ error: '수량 변경에 실패했습니다' });
  }
});

router.delete('/items/:itemId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;
    const { itemId } = req.params;

    const cartRepository = AppDataSource.getRepository(Cart);
    const cartItemRepository = AppDataSource.getRepository(CartItem);

    const cart = await cartRepository.findOne({
      where: { userId, isActive: true },
    });

    if (!cart) {
      return res.status(404).json({ error: '장바구니를 찾을 수 없습니다' });
    }

    const item = await cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다' });
    }

    await cartItemRepository.remove(item);
    return res.status(204).send();
  } catch (error) {
    console.error('Failed to remove cart item:', error);
    return res.status(500).json({ error: '상품 삭제에 실패했습니다' });
  }
});

router.post('/items/remove-selected', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;
    const { itemIds } = req.body;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ error: '삭제할 상품을 선택해주세요' });
    }

    const cartRepository = AppDataSource.getRepository(Cart);
    const cartItemRepository = AppDataSource.getRepository(CartItem);

    const cart = await cartRepository.findOne({
      where: { userId, isActive: true },
    });

    if (!cart) {
      return res.status(404).json({ error: '장바구니를 찾을 수 없습니다' });
    }

    const items = await cartItemRepository.find({
      where: { id: In(itemIds), cartId: cart.id },
    });

    if (items.length === 0) {
      return res.status(404).json({ error: '삭제할 상품을 찾을 수 없습니다' });
    }

    await cartItemRepository.remove(items);
    return res.json({ removedCount: items.length });
  } catch (error) {
    console.error('Failed to remove selected cart items:', error);
    return res.status(500).json({ error: '선택 삭제에 실패했습니다' });
  }
});

export { router as cartRoutes };
