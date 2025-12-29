import type { Request, Response } from 'express';
import type { InvestmentInfoService } from '../application/InvestmentInfoService';

export class InvestmentInfoController {
  constructor(private readonly investmentInfoService: InvestmentInfoService) {}

  async getInvestmentInfos(req: Request, res: Response): Promise<void> {
    try {
      const keyword = req.query.keyword as string | undefined;
      const result = await this.investmentInfoService.getInvestmentInfosForAdmin(keyword);
      res.json(result);
    } catch (error) {
      console.error('Error fetching investment infos:', error);
      res.status(500).json({ error: 'Failed to fetch investment infos' });
    }
  }

  async getInvestmentInfoById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid investment info ID' });
        return;
      }

      const info = await this.investmentInfoService.getInvestmentInfoByIdForAdmin(id);
      if (!info) {
        res.status(404).json({ error: 'Investment info not found' });
        return;
      }

      res.json(info);
    } catch (error) {
      console.error('Error fetching investment info:', error);
      res.status(500).json({ error: 'Failed to fetch investment info' });
    }
  }

  async createInvestmentInfo(req: Request, res: Response): Promise<void> {
    try {
      const { title, content, typeId, isVisible } = req.body;

      if (!title || !content) {
        res.status(400).json({ error: 'Title and content are required' });
        return;
      }

      if (!typeId || isNaN(parseInt(typeId, 10))) {
        res.status(400).json({ error: 'Valid typeId is required' });
        return;
      }

      const info = await this.investmentInfoService.createInvestmentInfo({
        title,
        content,
        typeId: parseInt(typeId, 10),
        isVisible: isVisible !== undefined ? Boolean(isVisible) : true,
      });

      res.status(201).json(info);
    } catch (error) {
      console.error('Error creating investment info:', error);
      res.status(500).json({ error: 'Failed to create investment info' });
    }
  }

  async updateInvestmentInfo(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid investment info ID' });
        return;
      }

      const { title, content, typeId, isVisible } = req.body;

      const info = await this.investmentInfoService.updateInvestmentInfo(id, {
        title,
        content,
        typeId: typeId ? parseInt(typeId, 10) : undefined,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : undefined,
      });

      if (!info) {
        res.status(404).json({ error: 'Investment info not found' });
        return;
      }

      res.json(info);
    } catch (error) {
      console.error('Error updating investment info:', error);
      res.status(500).json({ error: 'Failed to update investment info' });
    }
  }

  async deleteInvestmentInfo(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid investment info ID' });
        return;
      }

      const success = await this.investmentInfoService.deleteInvestmentInfo(id);
      if (!success) {
        res.status(404).json({ error: 'Investment info not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting investment info:', error);
      res.status(500).json({ error: 'Failed to delete investment info' });
    }
  }
}
