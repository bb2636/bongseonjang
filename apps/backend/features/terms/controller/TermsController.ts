import type { Request, Response } from 'express';
import type { TermsService } from '../application/TermsService.js';
import type { TermsType } from '../../../entity/index.js';

const DEFAULT_TERMS_TYPE: TermsType = 'SERVICE';

export class TermsController {
  constructor(private readonly termsService: TermsService) {}

  async getLatestTerms(req: Request, res: Response): Promise<void> {
    try {
      const type = (req.query.type as TermsType | undefined) ?? DEFAULT_TERMS_TYPE;
      const terms = await this.termsService.getLatestTerms(type);

      if (!terms) {
        res.status(404).json({ message: 'Terms not found' });
        return;
      }

      res.json(terms);
    } catch (error) {
      console.error('Error fetching terms:', error);
      res.status(500).json({ message: 'Failed to fetch terms' });
    }
  }

  async getTermsList(req: Request, res: Response): Promise<void> {
    try {
      const type = req.query.type as TermsType | undefined;
      const termsList = await this.termsService.getAllTerms(type);
      res.json(termsList);
    } catch (error) {
      console.error('Error fetching terms list:', error);
      res.status(500).json({ message: 'Failed to fetch terms list' });
    }
  }

  async getTermsById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        res.status(400).json({ message: 'Invalid terms id' });
        return;
      }

      const terms = await this.termsService.getTermsById(id);
      if (!terms) {
        res.status(404).json({ message: 'Terms not found' });
        return;
      }

      res.json(terms);
    } catch (error) {
      console.error('Error fetching terms by id:', error);
      res.status(500).json({ message: 'Failed to fetch terms' });
    }
  }

  async createTerms(req: Request, res: Response): Promise<void> {
    try {
      const { type, title, content, isActive } = req.body;

      if (!type || !title || !content) {
        res.status(400).json({ message: 'type, title, and content are required' });
        return;
      }

      const terms = await this.termsService.createTerms({
        type,
        title,
        content,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      });

      res.status(201).json(terms);
    } catch (error) {
      console.error('Error creating terms:', error);
      res.status(500).json({ message: 'Failed to create terms' });
    }
  }

  async updateTerms(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        res.status(400).json({ message: 'Invalid terms id' });
        return;
      }

      const { title, content, isActive } = req.body;

      const terms = await this.termsService.updateTerms(id, {
        title,
        content,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      });

      if (!terms) {
        res.status(404).json({ message: 'Terms not found' });
        return;
      }

      res.json(terms);
    } catch (error) {
      console.error('Error updating terms:', error);
      res.status(500).json({ message: 'Failed to update terms' });
    }
  }
}
