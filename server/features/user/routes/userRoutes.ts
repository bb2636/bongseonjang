import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { ProductInquiry } from '../../../entity/ProductInquiry';
import { Product } from '../../../entity/Product';
import { authMiddleware } from '../../../common/middleware/authMiddleware';

const router = Router();

const INQUIRY_TYPE_LABELS: Record<string, string> = {
  product: '상품문의',
  shipping: '배송문의',
  exchange_return: '교환/반품',
  refund: '환불문의',
  other: '기타문의',
};

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

router.get('/me/inquiries', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const type = req.query.type as string | undefined;
    const sort = (req.query.sort as string) || 'latest';

    const inquiryRepository = AppDataSource.getRepository(ProductInquiry);
    const productRepository = AppDataSource.getRepository(Product);

    const queryBuilder = inquiryRepository
      .createQueryBuilder('inquiry')
      .leftJoin(Product, 'product', 'product.id = inquiry.productId')
      .select([
        'inquiry.id as id',
        'inquiry.inquiryType as "inquiryType"',
        'inquiry.productId as "productId"',
        'inquiry.question as question',
        'inquiry.answer as answer',
        'inquiry.createdAt as "createdAt"',
        'inquiry.answeredAt as "answeredAt"',
        'product.name as "productName"',
        'product.imageMain as "productImage"',
      ])
      .where('inquiry.authorId = :userId', { userId });

    if (type && type !== 'all') {
      queryBuilder.andWhere('inquiry.inquiryType = :type', { type });
    }

    const orderDirection = sort === 'oldest' ? 'ASC' : 'DESC';
    queryBuilder.orderBy('inquiry.createdAt', orderDirection);

    const rawResults = await queryBuilder
      .offset(offset)
      .limit(limit)
      .getRawMany();

    const countQueryBuilder = inquiryRepository
      .createQueryBuilder('inquiry')
      .where('inquiry.authorId = :userId', { userId });

    if (type && type !== 'all') {
      countQueryBuilder.andWhere('inquiry.inquiryType = :type', { type });
    }

    const total = await countQueryBuilder.getCount();

    const inquiries = rawResults.map((row: any) => ({
      id: String(row.id),
      inquiryType: row.inquiryType,
      inquiryTypeLabel: INQUIRY_TYPE_LABELS[row.inquiryType] || '기타문의',
      productId: row.productId,
      productName: row.productName,
      productImage: row.productImage,
      question: row.question,
      answer: row.answer,
      status: row.answer ? 'answered' : 'pending',
      createdAt: formatDate(new Date(row.createdAt)),
      answeredAt: row.answeredAt ? formatDate(new Date(row.answeredAt)) : null,
    }));

    res.json({ inquiries, total, page, limit });
  } catch (error) {
    console.error('Failed to fetch user inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries', inquiries: [] });
  }
});

export default router;
