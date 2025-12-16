import type { Request, Response } from 'express';
import type { InquiryService } from '../application/InquiryService';
import type { InquiryType } from '../domain/Inquiry';
import type { AuthenticatedRequest } from '../../../common/middleware/authMiddleware';

export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) {}

  async getInquiries(req: Request, res: Response): Promise<void> {
    try {
      const { keyword, inquiryType, status, page, limit } = req.query;

      const result = await this.inquiryService.getInquiries({
        keyword: keyword as string | undefined,
        inquiryType: inquiryType as InquiryType | 'all' | undefined,
        status: status as 'all' | 'answered' | 'unanswered' | undefined,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
      });

      res.json(result);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
  }

  async getInquiryById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const inquiry = await this.inquiryService.getInquiryById(id);

      if (!inquiry) {
        res.status(404).json({ error: 'Inquiry not found' });
        return;
      }

      res.json(inquiry);
    } catch (error) {
      console.error('Error fetching inquiry:', error);
      res.status(500).json({ error: 'Failed to fetch inquiry' });
    }
  }

  async createInquiry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const authorId = req.userId;
      const { inquiryType, title, question, isPrivate, imageUrls } = req.body;

      if (!authorId) {
        res.status(401).json({ error: '로그인이 필요합니다.' });
        return;
      }

      if (!title || !question) {
        res.status(400).json({ error: '제목과 내용을 입력해주세요.' });
        return;
      }

      const newInquiry = await this.inquiryService.createInquiry({
        productId: Number.isNaN(id) ? null : req.params.id,
        inquiryType: (inquiryType as InquiryType) || 'product',
        authorId,
        title,
        question,
        isPrivate: Boolean(isPrivate),
        imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      });

      res.status(201).json(newInquiry);
    } catch (error) {
      console.error('Error creating inquiry:', error);
      res.status(500).json({ error: 'Failed to create inquiry' });
    }
  }

  async answerInquiry(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { answer } = req.body;
      const answeredBy = (req as any).user?.id || 'aaaa1111-1111-1111-1111-111111111111';

      if (!answer) {
        res.status(400).json({ error: 'Answer is required' });
        return;
      }

      await this.inquiryService.answerInquiry(id, answer, answeredBy);
      res.json({ success: true });
    } catch (error) {
      console.error('Error answering inquiry:', error);
      res.status(500).json({ error: 'Failed to answer inquiry' });
    }
  }

  async deleteAnswer(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await this.inquiryService.deleteAnswer(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting answer:', error);
      res.status(500).json({ error: 'Failed to delete answer' });
    }
  }
}
