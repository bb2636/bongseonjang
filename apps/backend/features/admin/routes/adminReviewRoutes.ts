import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Review } from '../../../entity/Review';
import { ReviewImage } from '../../../entity/ReviewImage';
import { Product } from '../../../entity/Product';
import { User } from '../../../entity/User';
import { ProductImage } from '../../../entity/ProductImage';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, page = '1', limit = '20', rating } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    const reviewRepository = AppDataSource.getRepository(Review);

    let queryBuilder = reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.product', 'product')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.images', 'images');

    if (search && typeof search === 'string' && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      queryBuilder = queryBuilder.where(
        '(product.name ILIKE :search OR user.name ILIKE :search OR review.content ILIKE :search)',
        { search: searchTerm }
      );
    }

    if (rating && typeof rating === 'string') {
      const ratingNum = parseInt(rating, 10);
      if (ratingNum >= 1 && ratingNum <= 5) {
        if (search && typeof search === 'string' && search.trim()) {
          queryBuilder = queryBuilder.andWhere('review.rating = :rating', { rating: ratingNum });
        } else {
          queryBuilder = queryBuilder.where('review.rating = :rating', { rating: ratingNum });
        }
      }
    }

    const totalCount = await queryBuilder.getCount();

    const reviews = await queryBuilder
      .orderBy('review.createdAt', 'DESC')
      .skip(offset)
      .take(limitNum)
      .getMany();

    const productIds = [...new Set(reviews.map(r => r.productId))];
    const thumbnailMap = new Map<string, string | null>();

    if (productIds.length > 0) {
      const productImageRepository = AppDataSource.getRepository(ProductImage);
      const thumbnails = await productImageRepository
        .createQueryBuilder('pi')
        .where('pi.productId IN (:...productIds)', { productIds })
        .andWhere('pi.isThumbnail = :isThumbnail', { isThumbnail: true })
        .getMany();

      thumbnails.forEach(t => {
        thumbnailMap.set(t.productId, t.imageUrl);
      });
    }

    const items = reviews.map((review) => ({
      id: review.id,
      productId: review.productId,
      productName: review.product?.name || null,
      productThumbnail: thumbnailMap.get(review.productId) || null,
      userId: review.userId,
      userName: review.user?.name || null,
      rating: review.rating,
      content: review.content,
      images: (review.images || []).map(img => ({
        id: img.id,
        imageUrl: img.imageUrl,
      })),
      createdAt: review.createdAt,
    }));

    return res.json({
      items,
      totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    console.error('Failed to get admin reviews:', error);
    return res.status(500).json({ error: '리뷰 목록을 불러오는데 실패했습니다' });
  }
});

router.get('/:reviewId', async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;

    const reviewRepository = AppDataSource.getRepository(Review);

    const review = await reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.product', 'product')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.images', 'images')
      .where('review.id = :reviewId', { reviewId })
      .getOne();

    if (!review) {
      return res.status(404).json({ error: '리뷰를 찾을 수 없습니다' });
    }

    const productImageRepository = AppDataSource.getRepository(ProductImage);
    const thumbnail = await productImageRepository.findOne({
      where: { productId: review.productId, isThumbnail: true },
    });

    return res.json({
      id: review.id,
      productId: review.productId,
      productName: review.product?.name || null,
      productThumbnail: thumbnail?.imageUrl || null,
      userId: review.userId,
      userName: review.user?.name || null,
      rating: review.rating,
      content: review.content,
      images: (review.images || []).map(img => ({
        id: img.id,
        imageUrl: img.imageUrl,
      })),
      createdAt: review.createdAt,
    });
  } catch (error) {
    console.error('Failed to get review detail:', error);
    return res.status(500).json({ error: '리뷰 정보를 불러오는데 실패했습니다' });
  }
});

router.delete('/:reviewId', async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;

    const reviewRepository = AppDataSource.getRepository(Review);

    const review = await reviewRepository.findOne({ where: { id: reviewId } });
    if (!review) {
      return res.status(404).json({ error: '리뷰를 찾을 수 없습니다' });
    }

    await reviewRepository.remove(review);

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete review:', error);
    return res.status(500).json({ error: '리뷰 삭제에 실패했습니다' });
  }
});

export { router as adminReviewRoutes };
