import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Cart } from '../../../entity/Cart';
import { CartItem } from '../../../entity/CartItem';
import { ProductImage } from '../../../entity/ProductImage';
import { ProductOption } from '../../../entity/ProductOption';
import { ProductExposureCategory } from '../../../entity/ProductExposureCategory';
import { authMiddleware, AuthenticatedRequest } from '../../../common/middleware/authMiddleware';
import { In } from 'typeorm';
import { toAbsoluteImageUrl } from '../../../common/utils/imageUrl.js';

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
      relations: ['product', 'product.shippingPolicy', 'productOption'],
      order: { createdAt: 'DESC' },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const validItems = items.filter(item => {
      if (!item.product) return false;
      if (item.product.saleEndDate) {
        const saleEndDate = new Date(item.product.saleEndDate);
        saleEndDate.setHours(23, 59, 59, 999);
        if (saleEndDate < today) {
          return false;
        }
      }
      return true;
    });

    const expiredItemIds = items
      .filter(item => !validItems.includes(item))
      .map(item => item.id);
    
    if (expiredItemIds.length > 0) {
      await cartItemRepository.delete({ id: In(expiredItemIds) });
    }

    const productIds = validItems.map(item => item.productId);
    const thumbnailMap = new Map<string, string>();
    const exposureCategoryMap = new Map<string, number[]>();
    
    if (productIds.length > 0) {
      const thumbnails = await imageRepository.find({
        where: { productId: In(productIds), isThumbnail: true },
      });
      for (const img of thumbnails) {
        thumbnailMap.set(img.productId, img.imageUrl);
      }
      
      const productExposureCategoryRepository = AppDataSource.getRepository(ProductExposureCategory);
      const exposureCategories = await productExposureCategoryRepository.find({
        where: { productId: In(productIds) },
      });
      for (const ec of exposureCategories) {
        const existing = exposureCategoryMap.get(ec.productId) || [];
        existing.push(Number(ec.exposureCategoryId));
        exposureCategoryMap.set(ec.productId, existing);
      }
    }

    const cartItems = validItems.map(item => {
      const productBasePrice = item.product?.basePrice ?? 0;
      const additionalPrice = item.productOption?.price ?? 0;
      const unitPrice = productBasePrice + additionalPrice;
      const totalPrice = unitPrice * item.quantity;

      const DEFAULT_FREE_SHIPPING_THRESHOLD = 30000;
      let shippingInfo = {
        shippingFee: item.product?.shippingPolicy?.shippingFee ?? 3500,
        freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD as number | null,
      };
      
      if (item.product?.detailContent) {
        try {
          const detailContent = JSON.parse(item.product.detailContent);
          if (detailContent.shippingInfo) {
            shippingInfo.shippingFee = detailContent.shippingInfo.shippingFee ?? shippingInfo.shippingFee;
            shippingInfo.freeShippingThreshold = detailContent.shippingInfo.freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD;
          }
        } catch {
        }
      }

      const optionDisplay = item.productOption 
        ? `${item.productOption.optionName}: ${item.productOption.optionValue}`
        : null;

      return {
        id: item.id,
        productId: item.productId,
        productName: item.product?.name ?? '',
        productImageUrl: toAbsoluteImageUrl(thumbnailMap.get(item.productId)) || 'https://placehold.co/58x58/f5f5f5/999999?text=No+Image',
        productOptionId: item.productOptionId,
        optionName: optionDisplay,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        shippingFee: shippingInfo.shippingFee,
        freeShippingThreshold: shippingInfo.freeShippingThreshold,
        productCategoryId: item.product?.productCategoryId ?? null,
        exposureCategoryIds: exposureCategoryMap.get(item.productId) || [],
      };
    });

    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    return res.json({
      id: cart.id,
      items: cartItems,
      subtotal,
      itemCount: cartItems.length,
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

    const productRepository = AppDataSource.getRepository(Product);
    const productOptionRepository = AppDataSource.getRepository(ProductOption);

    const product = await productRepository.findOne({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다' });
    }

    if (product.stockQuantity === 0) {
      return res.status(400).json({ error: '품절된 상품입니다' });
    }

    const totalRequestedQuantity = items.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 1), 0);
    if (product.stockQuantity < totalRequestedQuantity) {
      return res.status(400).json({ error: `재고가 부족합니다 (남은 수량: ${product.stockQuantity}개)` });
    }

    for (const item of items) {
      if (item.productOptionId) {
        const option = await productOptionRepository.findOne({ 
          where: { id: item.productOptionId, productId } 
        });
        if (!option) {
          return res.status(400).json({ error: '유효하지 않은 옵션입니다' });
        }
        if (option.stockQuantity === 0) {
          return res.status(400).json({ error: '해당 옵션은 품절되었습니다' });
        }
        const requestedQty = item.quantity || 1;
        if (option.stockQuantity < requestedQty) {
          return res.status(400).json({ error: `재고가 부족합니다 (남은 수량: ${option.stockQuantity}개)` });
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
      const { productOptionId, quantity } = item;
      const validQuantity = Math.max(1, Math.floor(quantity || 1));

      const existingItem = await cartItemRepository.findOne({
        where: {
          cartId: cart.id,
          productId,
          productOptionId: productOptionId || null,
        },
      });

      if (existingItem) {
        existingItem.quantity += validQuantity;
        await cartItemRepository.save(existingItem);
      } else {
        const newItem = cartItemRepository.create({
          cartId: cart.id,
          productId,
          productOptionId: productOptionId || null,
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

    const count = await cartItemRepository.count({
      where: { cartId: cart.id },
    });

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

    const { Product } = await import('../../../entity/Product');
    const productRepository = AppDataSource.getRepository(Product);
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

    const product = await productRepository.findOne({ where: { id: item.productId } });
    if (product && quantity > product.stockQuantity) {
      return res.status(400).json({ error: `재고가 부족합니다 (남은 수량: ${product.stockQuantity}개)` });
    }

    if (item.productOptionId) {
      const productOptionRepository = AppDataSource.getRepository(ProductOption);
      const option = await productOptionRepository.findOne({ where: { id: item.productOptionId } });
      if (option) {
        if (option.stockQuantity === 0) {
          return res.status(400).json({ error: '해당 옵션은 품절되었습니다' });
        }
        if (quantity > option.stockQuantity) {
          return res.status(400).json({ error: `재고가 부족합니다 (남은 수량: ${option.stockQuantity}개)` });
        }
      }
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

router.post('/merge', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: '항목 배열이 필요합니다' });
    }

    const { Product } = await import('../../../entity/Product');
    const productRepository = AppDataSource.getRepository(Product);
    const productOptionRepository = AppDataSource.getRepository(ProductOption);
    const cartRepository = AppDataSource.getRepository(Cart);
    const cartItemRepository = AppDataSource.getRepository(CartItem);

    let cart = await cartRepository.findOne({
      where: { userId, isActive: true },
    });

    if (!cart) {
      cart = cartRepository.create({ userId, isActive: true });
      await cartRepository.save(cart);
    }

    let mergedCount = 0;
    for (const item of items) {
      if (!item.productId) continue;

      const product = await productRepository.findOne({ where: { id: item.productId } });
      if (!product) continue;

      if (product.stockQuantity === 0) continue;

      if (item.optionId) {
        const option = await productOptionRepository.findOne({
          where: { id: item.optionId, productId: item.productId },
        });
        if (!option) continue;
      }

      const existingItem = await cartItemRepository.findOne({
        where: {
          cartId: cart.id,
          productId: item.productId,
          productOptionId: item.optionId || null,
        },
      });

      const quantity = Math.min(99, Math.max(1, Math.floor(item.quantity || 1)));

      if (existingItem) {
        existingItem.quantity += quantity;
        await cartItemRepository.save(existingItem);
      } else {
        const newItem = cartItemRepository.create({
          cartId: cart.id,
          productId: item.productId,
          productOptionId: item.optionId || null,
          quantity,
        });
        await cartItemRepository.save(newItem);
      }
      mergedCount++;
    }

    return res.json({ mergedCount });
  } catch (error) {
    console.error('Failed to merge cart:', error);
    return res.status(500).json({ error: '장바구니 병합에 실패했습니다' });
  }
});

export { router as cartRoutes };
