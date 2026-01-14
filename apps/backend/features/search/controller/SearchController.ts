import type { Request, Response } from 'express';
import type { SearchService } from '../application/SearchService';
import type { AuthenticatedRequest } from '../../../common/middleware/authMiddleware';

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

  async getUserSearchHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const limit = parseInt(req.query.limit as string) || 10;
      const history = await this.searchService.getUserSearchHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error('Error fetching user search history:', error);
      res.status(500).json({ error: 'Failed to fetch search history' });
    }
  }

  async addUserSearchHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { term } = req.body;
      if (!term || typeof term !== 'string') {
        res.status(400).json({ error: 'Search term is required' });
        return;
      }
      await this.searchService.addUserSearchHistory(userId, term);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error adding user search history:', error);
      res.status(500).json({ error: 'Failed to add search history' });
    }
  }

  async deleteUserSearchHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { term } = req.body;
      if (!term || typeof term !== 'string') {
        res.status(400).json({ error: 'Search term is required' });
        return;
      }
      await this.searchService.deleteUserSearchHistory(userId, term);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting user search history:', error);
      res.status(500).json({ error: 'Failed to delete search history' });
    }
  }

  async clearUserSearchHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      await this.searchService.clearUserSearchHistory(userId);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error clearing user search history:', error);
      res.status(500).json({ error: 'Failed to clear search history' });
    }
  }
}
