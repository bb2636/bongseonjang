import type { Request, Response } from 'express';
import type { SearchService } from '../application/SearchService';

export class SearchController {
  constructor(private searchService: SearchService) {}

  async getPopularSearchTerms(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const terms = await this.searchService.getPopularSearchTerms(limit);
      res.json(terms);
    } catch (error) {
      console.error('Error fetching popular search terms:', error);
      res.status(500).json({ error: 'Failed to fetch popular search terms' });
    }
  }

  async recordSearch(req: Request, res: Response): Promise<void> {
    try {
      const { term } = req.body;
      if (!term || typeof term !== 'string') {
        res.status(400).json({ error: 'Search term is required' });
        return;
      }
      await this.searchService.recordSearch(term);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error recording search:', error);
      res.status(500).json({ error: 'Failed to record search' });
    }
  }
}
