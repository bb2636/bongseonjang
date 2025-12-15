import type { Request, Response } from 'express';
import type { NoticeService } from '../application/NoticeService';

export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  async getNotices(req: Request, res: Response): Promise<void> {
    try {
      const keyword = req.query.keyword as string | undefined;
      const result = await this.noticeService.getNotices(keyword);
      res.json(result);
    } catch (error) {
      console.error('Error fetching notices:', error);
      res.status(500).json({ error: 'Failed to fetch notices' });
    }
  }

  async getNoticeById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid notice ID' });
        return;
      }

      const notice = await this.noticeService.getNoticeById(id);
      if (!notice) {
        res.status(404).json({ error: 'Notice not found' });
        return;
      }

      res.json(notice);
    } catch (error) {
      console.error('Error fetching notice:', error);
      res.status(500).json({ error: 'Failed to fetch notice' });
    }
  }

  async createNotice(req: Request, res: Response): Promise<void> {
    try {
      const { title, content, type } = req.body;

      if (!title || !content) {
        res.status(400).json({ error: 'Title and content are required' });
        return;
      }

      const validTypes = ['general', 'important', 'event'];
      const noticeType = validTypes.includes(type) ? type : 'general';

      const notice = await this.noticeService.createNotice({
        title,
        content,
        type: noticeType,
      });

      res.status(201).json(notice);
    } catch (error) {
      console.error('Error creating notice:', error);
      res.status(500).json({ error: 'Failed to create notice' });
    }
  }

  async updateNotice(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid notice ID' });
        return;
      }

      const { title, content, type } = req.body;
      const validTypes = ['general', 'important', 'event'];

      const notice = await this.noticeService.updateNotice(id, {
        title,
        content,
        type: validTypes.includes(type) ? type : undefined,
      });

      if (!notice) {
        res.status(404).json({ error: 'Notice not found' });
        return;
      }

      res.json(notice);
    } catch (error) {
      console.error('Error updating notice:', error);
      res.status(500).json({ error: 'Failed to update notice' });
    }
  }

  async deleteNotice(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid notice ID' });
        return;
      }

      const success = await this.noticeService.deleteNotice(id);
      if (!success) {
        res.status(404).json({ error: 'Notice not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting notice:', error);
      res.status(500).json({ error: 'Failed to delete notice' });
    }
  }
}
