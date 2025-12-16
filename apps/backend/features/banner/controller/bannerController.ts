import { Request, Response } from 'express';
import { bannerRepository } from '../repository/bannerRepository';

export class BannerController {
  async getPositions(req: Request, res: Response): Promise<void> {
    try {
      const positions = await bannerRepository.findAllPositions();
      res.json(positions);
    } catch (error) {
      console.error('Failed to get banner positions:', error);
      res.status(500).json({ message: '배너 위치 목록을 불러오는데 실패했습니다' });
    }
  }

  async getBannersByPosition(req: Request, res: Response): Promise<void> {
    try {
      const positionCode = req.query.position as string;
      if (!positionCode) {
        res.status(400).json({ message: '위치 코드가 필요합니다' });
        return;
      }

      const banners = await bannerRepository.findBannersByPositionCode(positionCode);
      res.json(banners);
    } catch (error) {
      console.error('Failed to get banners:', error);
      res.status(500).json({ message: '배너 목록을 불러오는데 실패했습니다' });
    }
  }

  async getBannerById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: '유효하지 않은 배너 ID입니다' });
        return;
      }

      const banner = await bannerRepository.findBannerById(id);
      if (!banner) {
        res.status(404).json({ message: '배너를 찾을 수 없습니다' });
        return;
      }

      res.json(banner);
    } catch (error) {
      console.error('Failed to get banner:', error);
      res.status(500).json({ message: '배너를 불러오는데 실패했습니다' });
    }
  }

  async createBanner(req: Request, res: Response): Promise<void> {
    try {
      const { bannerPositionId, title, imageUrl, linkUrl, isActive, startedAt, endedAt } = req.body;

      if (!bannerPositionId || !imageUrl) {
        res.status(400).json({ message: '필수 필드가 누락되었습니다' });
        return;
      }

      const banner = await bannerRepository.createBanner({
        bannerPositionId,
        title,
        imageUrl,
        linkUrl,
        isActive: isActive ?? true,
        startedAt: startedAt ? new Date(startedAt) : null,
        endedAt: endedAt ? new Date(endedAt) : null,
      });

      res.status(201).json(banner);
    } catch (error) {
      console.error('Failed to create banner:', error);
      res.status(500).json({ message: '배너 생성에 실패했습니다' });
    }
  }

  async updateBanner(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: '유효하지 않은 배너 ID입니다' });
        return;
      }

      const { title, imageUrl, linkUrl, isActive, startedAt, endedAt } = req.body;

      const banner = await bannerRepository.updateBanner(id, {
        title,
        imageUrl,
        linkUrl,
        isActive,
        startedAt: startedAt ? new Date(startedAt) : null,
        endedAt: endedAt ? new Date(endedAt) : null,
      });

      if (!banner) {
        res.status(404).json({ message: '배너를 찾을 수 없습니다' });
        return;
      }

      res.json(banner);
    } catch (error) {
      console.error('Failed to update banner:', error);
      res.status(500).json({ message: '배너 수정에 실패했습니다' });
    }
  }

  async deleteBanner(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: '유효하지 않은 배너 ID입니다' });
        return;
      }

      const deleted = await bannerRepository.deleteBanner(id);
      if (!deleted) {
        res.status(404).json({ message: '배너를 찾을 수 없습니다' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Failed to delete banner:', error);
      res.status(500).json({ message: '배너 삭제에 실패했습니다' });
    }
  }

  async reorderBanners(req: Request, res: Response): Promise<void> {
    try {
      const { bannerIds } = req.body;
      if (!Array.isArray(bannerIds)) {
        res.status(400).json({ message: '배너 ID 배열이 필요합니다' });
        return;
      }

      await bannerRepository.updateBannerSortOrders(bannerIds);
      res.json({ message: '배너 순서가 업데이트되었습니다' });
    } catch (error) {
      console.error('Failed to reorder banners:', error);
      res.status(500).json({ message: '배너 순서 변경에 실패했습니다' });
    }
  }
}

export const bannerController = new BannerController();
