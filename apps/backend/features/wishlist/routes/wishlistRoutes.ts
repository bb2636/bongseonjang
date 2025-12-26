import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Wishlist } from '../../../entity/Wishlist';
import { WishlistItem } from '../../../entity/WishlistItem';
import { Product } from '../../../entity/Product';
import { ProductImage } from '../../../entity/ProductImage';
import { ProductOption } from '../../../entity/ProductOption';
import { authMiddleware, AuthenticatedRequest } from '../../../common/middleware/authMiddleware';
import { toAbsoluteImageUrl } from '../../../common/utils/imageUrl.js';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;

    const wishlistRepository = AppDataSource.getRepository(Wishlist);
    const wishlistItemRepository = AppDataSource.getRepository(WishlistItem);
    const productRepository = AppDataSource.getRepository(Product);
    const productImageRepository = AppDataSource.getRepository(ProductImage);
    const optionRepository = AppDataSource.getRepository(ProductOption);

    let wishlist = await wishlistRepository.findOne({
      where: { userId },
    });

    if (!wishlist) {
      return res.json({ items: [], count: 0 });
    }

    const wishlistItems = await wishlistItemRepository.find({
      where: { wishlistId: wishlist.id },
      order: { createdAt: 'DESC' },
    });

    const items = await Promise.all(
      wishlistItems.map(async (item) => {
        const product = await productRepository.findOne({
          where: { id: item.productId },
        });

        if (!product) return null;

        const thumbnailImage = await productImageRepository.findOne({
          where: { productId: product.id, isThumbnail: true },
        });

        const options = await optionRepository.find({
          where: { productId: product.id },
          order: { sortOrder: 'ASC' },
        });

        const optionPrices = options.filter(o => o.price !== null).map(o => o.price as number);
        const lowestPrice = optionPrices.length > 0 
          ? Math.min(...optionPrices)
          : product.basePrice;

        return {
          id: item.id,
          productId: product.id,
          name: product.name,
          originalPrice: product.basePrice,
          discountedPrice: lowestPrice,
          thumbnailUrl: toAbsoluteImageUrl(thumbnailImage?.imageUrl) || '',
          addedAt: item.createdAt,
        };
      })
    );

    const validItems = items.filter((item) => item !== null);

    return res.json({
      items: validItems,
      count: validItems.length,
    });
  } catch (error) {
    console.error('Failed to get wishlist:', error);
    return res.status(500).json({ error: '찜 목록을 불러오는데 실패했습니다' });
  }
});

router.post('/items', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;
    const { productId } = req.body;

    if (!productId || typeof productId !== 'string') {
      return res.status(400).json({ error: '유효한 productId가 필요합니다' });
    }

    const productRepository = AppDataSource.getRepository(Product);
    const product = await productRepository.findOne({ where: { id: productId } });
    
    if (!product) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다' });
    }

    const wishlistRepository = AppDataSource.getRepository(Wishlist);
    const wishlistItemRepository = AppDataSource.getRepository(WishlistItem);

    let wishlist = await wishlistRepository.findOne({
      where: { userId },
    });

    if (!wishlist) {
      wishlist = wishlistRepository.create({ userId });
      await wishlistRepository.save(wishlist);
    }

    const existingItem = await wishlistItemRepository.findOne({
      where: { wishlistId: wishlist.id, productId },
    });

    if (existingItem) {
      return res.json({ success: true, message: '이미 찜 목록에 있습니다', isWishlisted: true });
    }

    const newItem = wishlistItemRepository.create({
      wishlistId: wishlist.id,
      productId,
    });
    await wishlistItemRepository.save(newItem);

    return res.json({ success: true, message: '찜 목록에 추가되었습니다', isWishlisted: true });
  } catch (error) {
    console.error('Failed to add to wishlist:', error);
    return res.status(500).json({ error: '찜 추가에 실패했습니다' });
  }
});

router.delete('/items/:productId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;
    const { productId } = req.params;

    const wishlistRepository = AppDataSource.getRepository(Wishlist);
    const wishlistItemRepository = AppDataSource.getRepository(WishlistItem);

    const wishlist = await wishlistRepository.findOne({
      where: { userId },
    });

    if (!wishlist) {
      return res.json({ success: true, message: '찜 목록에서 삭제되었습니다', isWishlisted: false });
    }

    await wishlistItemRepository.delete({
      wishlistId: wishlist.id,
      productId,
    });

    return res.json({ success: true, message: '찜 목록에서 삭제되었습니다', isWishlisted: false });
  } catch (error) {
    console.error('Failed to remove from wishlist:', error);
    return res.status(500).json({ error: '찜 삭제에 실패했습니다' });
  }
});

router.get('/check/:productId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;
    const { productId } = req.params;

    const wishlistRepository = AppDataSource.getRepository(Wishlist);
    const wishlistItemRepository = AppDataSource.getRepository(WishlistItem);

    const wishlist = await wishlistRepository.findOne({
      where: { userId },
    });

    if (!wishlist) {
      return res.json({ isWishlisted: false });
    }

    const existingItem = await wishlistItemRepository.findOne({
      where: { wishlistId: wishlist.id, productId },
    });

    return res.json({ isWishlisted: !!existingItem });
  } catch (error) {
    console.error('Failed to check wishlist:', error);
    return res.status(500).json({ error: '찜 상태 확인에 실패했습니다' });
  }
});

router.get('/count', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;

    const wishlistRepository = AppDataSource.getRepository(Wishlist);
    const wishlistItemRepository = AppDataSource.getRepository(WishlistItem);

    const wishlist = await wishlistRepository.findOne({
      where: { userId },
    });

    if (!wishlist) {
      return res.json({ count: 0 });
    }

    const count = await wishlistItemRepository.count({
      where: { wishlistId: wishlist.id },
    });

    return res.json({ count });
  } catch (error) {
    console.error('Failed to get wishlist count:', error);
    return res.status(500).json({ error: '찜 개수 조회에 실패했습니다' });
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

    const productRepository = AppDataSource.getRepository(Product);
    const wishlistRepository = AppDataSource.getRepository(Wishlist);
    const wishlistItemRepository = AppDataSource.getRepository(WishlistItem);

    let wishlist = await wishlistRepository.findOne({
      where: { userId },
    });

    if (!wishlist) {
      wishlist = wishlistRepository.create({ userId });
      await wishlistRepository.save(wishlist);
    }

    let mergedCount = 0;
    for (const item of items) {
      if (!item.productId) continue;

      const product = await productRepository.findOne({ where: { id: item.productId } });
      if (!product) continue;

      const existingItem = await wishlistItemRepository.findOne({
        where: { wishlistId: wishlist.id, productId: item.productId },
      });

      if (!existingItem) {
        const newItem = wishlistItemRepository.create({
          wishlistId: wishlist.id,
          productId: item.productId,
        });
        await wishlistItemRepository.save(newItem);
        mergedCount++;
      }
    }

    return res.json({ mergedCount });
  } catch (error) {
    console.error('Failed to merge wishlist:', error);
    return res.status(500).json({ error: '찜 목록 병합에 실패했습니다' });
  }
});

export { router as wishlistRoutes };
