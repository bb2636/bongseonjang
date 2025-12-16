import { Router, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { ProductInquiry } from '../../../entity/ProductInquiry';
import { Product } from '../../../entity/Product';
import { authMiddleware, AuthenticatedRequest } from '../../../common/middleware/authMiddleware';

const router = Router();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

router.get('/my', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const inquiryRepository = AppDataSource.getRepository(ProductInquiry);
    const productRepository = AppDataSource.getRepository(Product);

    const inquiries = await inquiryRepository.find({
      where: { authorId: userId },
      order: { createdAt: 'DESC' },
    });

    const inquiriesWithProducts = await Promise.all(
      inquiries.map(async (inquiry: ProductInquiry) => {
        let productName = null;
        if (inquiry.productId) {
          const product = await productRepository.findOne({
            where: { id: inquiry.productId },
            select: ['name'],
          });
          productName = product?.name || null;
        }

        return {
          id: Number(inquiry.id),
          inquiryType: inquiry.inquiryType,
          productId: inquiry.productId,
          productName,
          question: inquiry.question,
          answer: inquiry.answer,
          isAnswered: inquiry.answer !== null,
          createdAt: inquiry.createdAt,
          answeredAt: inquiry.answeredAt,
        };
      })
    );

    res.json({ inquiries: inquiriesWithProducts });
  } catch (error) {
    console.error('Failed to get my inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const id = parseInt(req.params.id, 10);
    const inquiryRepository = AppDataSource.getRepository(ProductInquiry);
    const productRepository = AppDataSource.getRepository(Product);

    const inquiry = await inquiryRepository.findOne({
      where: { id, authorId: userId },
    });

    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    let productName = null;
    if (inquiry.productId) {
      const product = await productRepository.findOne({
        where: { id: inquiry.productId },
        select: ['name'],
      });
      productName = product?.name || null;
    }

    res.json({
      id: Number(inquiry.id),
      inquiryType: inquiry.inquiryType,
      productId: inquiry.productId,
      productName,
      question: inquiry.question,
      answer: inquiry.answer,
      answeredAt: inquiry.answeredAt,
      createdAt: inquiry.createdAt,
    });
  } catch (error) {
    console.error('Failed to get inquiry detail:', error);
    res.status(500).json({ error: 'Failed to fetch inquiry' });
  }
});

router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { inquiryType, productId, question } = req.body;

    if (!question || question.trim().length < 10) {
      return res.status(400).json({ error: 'Question must be at least 10 characters' });
    }

    const validTypes = ['product', 'shipping', 'exchange_return', 'refund', 'other'];
    if (!validTypes.includes(inquiryType)) {
      return res.status(400).json({ error: 'Invalid inquiry type' });
    }

    if (productId) {
      if (!UUID_REGEX.test(productId)) {
        return res.status(400).json({ error: 'Invalid product ID format' });
      }
      const productRepository = AppDataSource.getRepository(Product);
      const product = await productRepository.findOne({ where: { id: productId } });
      if (!product) {
        return res.status(400).json({ error: 'Product not found' });
      }
    }

    const inquiryRepository = AppDataSource.getRepository(ProductInquiry);

    const inquiry = inquiryRepository.create({
      inquiryType,
      productId: productId || null,
      authorId: userId,
      question: question.trim(),
    });

    const savedInquiry = await inquiryRepository.save(inquiry);

    res.status(201).json({ id: Number(savedInquiry.id) });
  } catch (error) {
    console.error('Failed to create inquiry:', error);
    res.status(500).json({ error: 'Failed to create inquiry' });
  }
});

export default router;
