import type { Request, Response } from 'express';
import type { ReviewService } from '../application/ReviewService';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  async getReviewsByProductId(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const reviews = await this.reviewService.getReviewsByProductId(productId);
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  }

  async getReviewStats(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const stats = await this.reviewService.getReviewStatsByProductId(productId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching review stats:', error);
      res.status(500).json({ error: 'Failed to fetch review stats' });
    }
  }

  async createReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { productId, rating, content, imageUrls, orderItemId } = req.body;

      if (!productId || !rating || !content) {
        res.status(400).json({ error: 'productId, rating, and content are required' });
        return;
      }

      if (rating < 1 || rating > 5) {
        res.status(400).json({ error: 'Rating must be between 1 and 5' });
        return;
      }

      const review = await this.reviewService.createReview(userId, {
        productId,
        rating,
        content,
        imageUrls: imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0
          ? imageUrls
          : undefined,
        orderItemId,
      });

      res.status(201).json(review);
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ error: 'Failed to create review' });
    }
  }

  async deleteReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      await this.reviewService.deleteReview(id, userId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Review not found') {
          res.status(404).json({ error: error.message });
          return;
        }
        if (error.message === 'Unauthorized to delete this review') {
          res.status(403).json({ error: error.message });
          return;
        }
      }
      console.error('Error deleting review:', error);
      res.status(500).json({ error: 'Failed to delete review' });
    }
  }

  async checkUserReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { productId } = req.params;
      
      if (!productId) {
        res.status(400).json({ error: 'Product ID is required' });
        return;
      }

      const hasReviewed = await this.reviewService.hasUserReviewedProduct(userId, productId);
      
      res.json({ hasReviewed });
    } catch (error) {
      console.error('Error checking user review:', error);
      res.status(500).json({ error: 'Failed to check user review' });
    }
  }

  async getPendingReviewItems(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const items = await this.reviewService.getPendingReviewItems(userId);
      res.json(items);
    } catch (error) {
      console.error('Error fetching pending review items:', error);
      res.status(500).json({ error: 'Failed to fetch pending review items' });
    }
  }
}
