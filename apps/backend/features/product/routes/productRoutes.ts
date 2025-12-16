import { Router, Request, Response } from 'express';
import { ProductController } from '../controller/ProductController';
import { ProductService } from '../application/ProductService';
import { TypeORMProductRepository } from '../repository/TypeORMProductRepository';
import { ReviewService, TypeORMReviewRepository, TypeORMReviewImageRepository } from '../../review';
import { TypeORMReviewableOrderItemRepository } from '../../review/repository/TypeORMReviewableOrderItemRepository';
import { AppDataSource } from '../../../config/database';
import { ProductInquiry } from '../../../entity/ProductInquiry';
import { User } from '../../../entity/User';
import { authMiddleware, AuthenticatedRequest } from '../../../common/middleware/authMiddleware';
import { InquiryService } from '../../inquiry/application/InquiryService';
import { TypeORMInquiryRepository } from '../../inquiry/repository/TypeORMInquiryRepository';

const router = Router();

const productRepository = new TypeORMProductRepository();
const reviewRepository = new TypeORMReviewRepository();
const reviewImageRepository = new TypeORMReviewImageRepository();
const reviewableOrderItemRepository = new TypeORMReviewableOrderItemRepository();
const reviewService = new ReviewService(reviewRepository, reviewImageRepository, reviewableOrderItemRepository);
const productService = new ProductService(productRepository, reviewService);
const productController = new ProductController(productService);
const inquiryRepository = new TypeORMInquiryRepository();
const inquiryService = new InquiryService(inquiryRepository);

function maskAuthorName(name: string): string {
  if (!name || name.length === 0) return '***';
  if (name.length === 1) return name + '**';
  if (name.length === 2) return name[0] + '*' + name[1];
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const INQUIRY_TYPE_LABELS: Record<string, string> = {
  product: '상품문의',
  shipping: '배송문의',
  exchange_return: '교환/반품',
  refund: '환불문의',
  other: '기타문의',
};

router.get('/:id/inquiries', async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const inquiryRepository = AppDataSource.getRepository(ProductInquiry);

    const rawResults = await inquiryRepository
      .createQueryBuilder('inquiry')
      .leftJoin(User, 'author', 'author.id = inquiry.authorId')
      .select([
        'inquiry.id as id',
        'inquiry.inquiryType as "inquiryType"',
        'inquiry.title as title',
        'inquiry.question as question',
        'inquiry.answer as answer',
        'inquiry.isPrivate as "isPrivate"',
        'inquiry.createdAt as "createdAt"',
        'author.name as "authorName"',
      ])
      .where('inquiry.productId = :productId', { productId })
      .orderBy('inquiry.createdAt', 'DESC')
      .offset(offset)
      .limit(limit)
      .getRawMany();

    const total = await inquiryRepository.count({ where: { productId } });

    const inquiries = rawResults.map((row) => ({
      id: String(row.id),
      status: row.answer ? 'answered' : 'pending',
      categoryLabel: '/' + (INQUIRY_TYPE_LABELS[row.inquiryType] || '상품문의'),
      authorAlias: maskAuthorName(row.authorName || '익명'),
      createdAt: formatDate(new Date(row.createdAt)),
      title: row.title || row.question,
      answer: row.answer || undefined,
      isPrivate: Boolean(row.isPrivate),
    }));

    res.json({ inquiries, total, page, limit });
  } catch (error) {
    console.error('Failed to fetch product inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries', inquiries: [] });
  }
});

router.post('/:id/inquiries', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authorId = req.userId;
    const productId = req.params.id;
    const { inquiryType, title, question, isPrivate, imageUrls } = req.body;

    if (!authorId) {
      res.status(401).json({ error: '로그인이 필요합니다.' });
      return;
    }

    if (!title || !question) {
      res.status(400).json({ error: '제목과 내용을 모두 입력해주세요.' });
      return;
    }

    const createdInquiry = await inquiryService.createInquiry({
      authorId,
      productId,
      inquiryType: inquiryType || 'product',
      title,
      question,
      isPrivate: Boolean(isPrivate),
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
    });

    res.status(201).json(createdInquiry);
  } catch (error) {
    console.error('Failed to create product inquiry:', error);
    res.status(500).json({ error: 'Failed to create inquiry' });
  }
});

router.get('/time-deals', (req, res) => productController.getTimeDeals(req, res));
router.get('/fresh', (req, res) => productController.getFreshProducts(req, res));
router.get('/tag/:tag', (req, res) => productController.getProductsByTag(req, res));
router.get('/category/:category', (req, res) => productController.getProductsByDisplayCategory(req, res));
router.get('/:id/related', (req, res) => productController.getRelatedProducts(req, res));
router.get('/:id', (req, res) => productController.getProductById(req, res));
router.get('/', (req, res) => productController.getAllProducts(req, res));

export default router;
