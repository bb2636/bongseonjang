import { Router } from 'express';
import { TypeORMFaqRepository } from '../repository/TypeORMFaqRepository';
import { TypeORMFaqCategoryRepository } from '../repository/TypeORMFaqCategoryRepository';

const router = Router();

const faqRepository = new TypeORMFaqRepository();
const faqCategoryRepository = new TypeORMFaqCategoryRepository();

router.get('/categories', async (_req, res) => {
  try {
    const categories = await faqCategoryRepository.findAll();
    res.json(categories.map(c => ({
      id: c.id,
      name: c.name,
      sortOrder: c.sortOrder,
    })));
  } catch (error) {
    console.error('Error fetching FAQ categories:', error);
    res.status(500).json({ error: 'Failed to fetch FAQ categories' });
  }
});

router.get('/', async (req, res) => {
  try {
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const keyword = req.query.keyword as string | undefined;
    
    const faqs = await faqRepository.findAll({
      categoryId,
      keyword,
      isVisible: true,
    });
    
    res.json({
      faqs: faqs.map(faq => ({
        id: faq.id,
        categoryId: faq.categoryId,
        title: faq.title,
        content: faq.content,
      })),
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
});

export default router;
