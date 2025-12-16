import { Router } from 'express';
import { FaqController } from '../controller/FaqController';
import { FaqService } from '../application/FaqService';
import { TypeORMFaqRepository } from '../repository/TypeORMFaqRepository';
import { TypeORMFaqCategoryRepository } from '../repository/TypeORMFaqCategoryRepository';

const router = Router();

const faqRepository = new TypeORMFaqRepository();
const faqCategoryRepository = new TypeORMFaqCategoryRepository();
const faqService = new FaqService(faqRepository);
const faqController = new FaqController(faqService);

router.get('/categories', async (req, res) => {
  try {
    const categories = await faqCategoryRepository.findAll();
    res.json(categories.map(c => ({
      id: Number(c.id),
      name: c.name,
      sortOrder: c.sortOrder,
    })));
  } catch (error) {
    console.error('Error fetching FAQ categories:', error);
    res.status(500).json({ error: 'Failed to fetch FAQ categories' });
  }
});

router.get('/', (req, res) => faqController.getFaqs(req, res));
router.get('/:id', (req, res) => faqController.getFaqById(req, res));
router.post('/', (req, res) => faqController.createFaq(req, res));
router.put('/:id', (req, res) => faqController.updateFaq(req, res));
router.delete('/:id', (req, res) => faqController.deleteFaq(req, res));

export default router;
