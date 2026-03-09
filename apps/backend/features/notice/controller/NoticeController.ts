import type { Request, Response } from 'express';
import type { NoticeService } from '../application/NoticeService';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  async getNotices(req: Request, res: Response): Promise<void> {
    try {
      const keyword = req.query.keyword as string | undefined;
      const result = await this.noticeService.getNoticesForAdmin(keyword);
      res.json(result);
    } catch (error) {
      console.error('[NoticeController.getNotices] Error:', error);
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

      const notice = await this.noticeService.getNoticeByIdForAdmin(id);
      if (!notice) {
        res.status(404).json({ error: 'Notice not found' });
        return;
      }

      res.json(notice);
    } catch (error) {
      console.error('[NoticeController.getNoticeById] Error:', error);
      res.status(500).json({ error: 'Failed to fetch notice' });
    }
  }

  async createNotice(req: Request, res: Response): Promise<void> {
    try {
      const { title, content, typeId, isVisible } = req.body;
      const contentPreview = typeof content === 'string' ? content.slice(0, 50) : content;
      console.log('[NoticeController.createNotice] Request body:', { title, content: contentPreview, typeId, isVisible });

      if (!title || !content) {
        res.status(400).json({ error: 'Title and content are required' });
        return;
      }

      if (!typeId || isNaN(parseInt(String(typeId), 10))) {
        res.status(400).json({ error: 'Valid typeId is required' });
        return;
      }

      const notice = await this.noticeService.createNotice({
        title,
        content,
        typeId: parseInt(String(typeId), 10),
        isVisible: isVisible !== undefined ? Boolean(isVisible) : true,
      });

      res.status(201).json(notice);
    } catch (error) {
      console.error('[NoticeController.createNotice] Error:', error);
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

      const { title, content, typeId, isVisible } = req.body;

      const notice = await this.noticeService.updateNotice(id, {
        title,
        content,
        typeId: typeId ? parseInt(String(typeId), 10) : undefined,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : undefined,
      });

      if (!notice) {
        res.status(404).json({ error: 'Notice not found' });
        return;
      }

      res.json(notice);
    } catch (error) {
      console.error('[NoticeController.updateNotice] Error:', error);
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
      console.error('[NoticeController.deleteNotice] Error:', error);
      res.status(500).json({ error: 'Failed to delete notice' });
    }
  }
}
