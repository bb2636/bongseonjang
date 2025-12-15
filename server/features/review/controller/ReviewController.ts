import type { Request, Response } from 'express';
import type { ReviewService } from '../application/ReviewService';
import { ObjectStorageService } from '../../../objectStorage';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

const MAX_REVIEW_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_REVIEW_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export class ReviewController {
  private readonly objectStorageService: ObjectStorageService;

  constructor(private readonly reviewService: ReviewService) {
    this.objectStorageService = new ObjectStorageService();
  }

  private async validateImageUrl(imageUrl: string): Promise<{ valid: boolean; error?: string }> {
    if (!imageUrl.startsWith('/objects/')) {
      return { valid: false, error: 'Invalid image path format' };
    }

    try {
      const objectFile = await this.objectStorageService.getObjectEntityFile(imageUrl);
      const [metadata] = await objectFile.getMetadata();
      
      const actualSize = Number(metadata.size);
      const actualContentType = metadata.contentType || '';

      if (actualSize > MAX_REVIEW_IMAGE_SIZE) {
        await objectFile.delete();
        return { valid: false, error: 'Image file too large' };
      }

      const isExactMimeMatch = ALLOWED_REVIEW_MIME_TYPES.includes(actualContentType);
      
      if (!isExactMimeMatch) {
        await objectFile.delete();
        return { valid: false, error: 'Invalid image type. Only JPEG, PNG, GIF, and WebP are allowed.' };
      }

      const buffer = await this.downloadFirstBytes(objectFile, 16);
      if (!this.isValidImageMagicBytes(buffer, actualContentType)) {
        await objectFile.delete();
        return { valid: false, error: 'File content does not match declared type' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Image not found or inaccessible' };
    }
  }

  private async downloadFirstBytes(objectFile: any, numBytes: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      let bytesRead = 0;
      
      const stream = objectFile.createReadStream({ start: 0, end: numBytes - 1 });
      
      stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
        bytesRead += chunk.length;
        if (bytesRead >= numBytes) {
          stream.destroy();
        }
      });
      
      stream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      
      stream.on('error', (err: Error) => {
        reject(err);
      });
    });
  }

  private isValidImageMagicBytes(buffer: Buffer, declaredMimeType: string): boolean {
    if (buffer.length < 4) return false;

    const magicBytes: Record<string, number[][]> = {
      'image/jpeg': [[0xFF, 0xD8, 0xFF]],
      'image/png': [[0x89, 0x50, 0x4E, 0x47]],
      'image/gif': [[0x47, 0x49, 0x46, 0x38]],
      'image/webp': [[0x52, 0x49, 0x46, 0x46]],
    };

    const expectedPatterns = magicBytes[declaredMimeType];
    if (!expectedPatterns) return false;

    return expectedPatterns.some(pattern => 
      pattern.every((byte, index) => buffer[index] === byte)
    );
  }

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

      const { productId, rating, content, imageUrls } = req.body;

      if (!productId || !rating || !content) {
        res.status(400).json({ error: 'productId, rating, and content are required' });
        return;
      }

      if (rating < 1 || rating > 5) {
        res.status(400).json({ error: 'Rating must be between 1 and 5' });
        return;
      }

      let validatedImageUrls: string[] = [];
      if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
        for (const imageUrl of imageUrls) {
          if (typeof imageUrl !== 'string') {
            res.status(400).json({ error: 'Invalid image URL format' });
            return;
          }
          
          const validation = await this.validateImageUrl(imageUrl);
          if (!validation.valid) {
            res.status(400).json({ error: validation.error || 'Invalid image' });
            return;
          }
          validatedImageUrls.push(imageUrl);
        }
      }

      const review = await this.reviewService.createReview(userId, {
        productId,
        rating,
        content,
        imageUrls: validatedImageUrls,
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
}
