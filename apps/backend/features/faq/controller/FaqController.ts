import type { Request, Response } from 'express';
import type { FaqService } from '../application/FaqService';

export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  async getFaqs(req: Request, res: Response): Promise<void> {
    try {
      const keyword = req.query.keyword as string | undefined;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined;
      const result = await this.faqService.getFaqsForAdmin(keyword, categoryId);
      res.json(result);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
  }

  async getFaqById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid FAQ ID' });
        return;
      }

      const faq = await this.faqService.getFaqByIdForAdmin(id);
      if (!faq) {
        res.status(404).json({ error: 'FAQ not found' });
        return;
      }

      res.json(faq);
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      res.status(500).json({ error: 'Failed to fetch FAQ' });
    }
  }

  async createFaq(req: Request, res: Response): Promise<void> {
    try {
      const { title, content, categoryId, isVisible } = req.body;

      if (!title || !content) {
        res.status(400).json({ error: 'Title and content are required' });
        return;
      }

      if (!categoryId || isNaN(parseInt(categoryId, 10))) {
        res.status(400).json({ error: 'Valid categoryId is required' });
        return;
      }

      const faq = await this.faqService.createFaq({
        title,
        content,
        categoryId: parseInt(categoryId, 10),
        isVisible: isVisible !== undefined ? Boolean(isVisible) : true,
      });

      res.status(201).json(faq);
    } catch (error) {
      console.error('Error creating FAQ:', error);
      res.status(500).json({ error: 'Failed to create FAQ' });
    }
  }

  async updateFaq(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid FAQ ID' });
        return;
      }

      const { title, content, categoryId, isVisible } = req.body;

      const faq = await this.faqService.updateFaq(id, {
        title,
        content,
        categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : undefined,
      });

      if (!faq) {
        res.status(404).json({ error: 'FAQ not found' });
        return;
      }

      res.json(faq);
    } catch (error) {
      console.error('Error updating FAQ:', error);
      res.status(500).json({ error: 'Failed to update FAQ' });
    }
  }

  async deleteFaq(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid FAQ ID' });
        return;
      }

      const success = await this.faqService.deleteFaq(id);
      if (!success) {
        res.status(404).json({ error: 'FAQ not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      res.status(500).json({ error: 'Failed to delete FAQ' });
    }
  }
}
