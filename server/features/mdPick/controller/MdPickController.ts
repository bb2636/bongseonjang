import type { Request, Response } from 'express';
import type { MdPickService } from '../application/MdPickService';

export class MdPickController {
  constructor(private readonly mdPickService: MdPickService) {}

  async getMdPicks(_req: Request, res: Response): Promise<void> {
    try {
      const mdPicks = await this.mdPickService.getMdPicks();
      res.json(mdPicks);
    } catch (error) {
      console.error('Failed to get MD picks:', error);
      res.status(500).json({ error: 'Failed to get MD picks' });
    }
  }
}
