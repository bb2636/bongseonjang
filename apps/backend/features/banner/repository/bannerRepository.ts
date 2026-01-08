import { AppDataSource } from '../../../config/database';
import { Banner } from '../../../entity/Banner';
import { BannerPosition } from '../../../entity/BannerPosition';

export class BannerRepository {
  private bannerRepo = AppDataSource.getRepository(Banner);
  private positionRepo = AppDataSource.getRepository(BannerPosition);

  async findAllPositions(): Promise<BannerPosition[]> {
    return this.positionRepo.find({
      where: { isActive: true },
      order: { sortNo: 'ASC' },
    });
  }

  async findPositionByCode(code: string): Promise<BannerPosition | null> {
    return this.positionRepo.findOne({
      where: { code, isActive: true },
    });
  }

  async findBannersByPositionCode(positionCode: string): Promise<Banner[]> {
    const position = await this.findPositionByCode(positionCode);
    if (!position) {
      return [];
    }

    return this.bannerRepo.find({
      where: { position: { id: position.id } },
      relations: ['position'],
      order: { sortNo: 'ASC' },
    });
  }

  async findBannerById(id: number): Promise<Banner | null> {
    return this.bannerRepo.findOne({
      where: { id },
      relations: ['position'],
    });
  }

  async createBanner(data: {
    bannerPositionId: number;
    title?: string | null;
    imageUrl: string;
    linkUrl?: string | null;
    isActive?: boolean;
    startedAt?: Date | null;
    endedAt?: Date | null;
    description?: string | null;
  }): Promise<Banner> {
    const banner = this.bannerRepo.create({
      position: { id: data.bannerPositionId },
      title: data.title,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl,
      isActive: data.isActive ?? true,
      startedAt: data.startedAt,
      endedAt: data.endedAt,
      description: data.description,
    });
    return this.bannerRepo.save(banner);
  }

  async updateBanner(id: number, data: Partial<Banner>): Promise<Banner | null> {
    await this.bannerRepo.update(id, data);
    return this.findBannerById(id);
  }

  async deleteBanner(id: number): Promise<boolean> {
    const result = await this.bannerRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async updateBannerSortOrders(bannerIds: number[]): Promise<void> {
    for (let i = 0; i < bannerIds.length; i++) {
      await this.bannerRepo.update(bannerIds[i], { sortNo: i });
    }
  }
}

export const bannerRepository = new BannerRepository();
