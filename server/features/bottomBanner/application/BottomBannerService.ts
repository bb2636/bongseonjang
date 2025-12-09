import type { BottomBannerImage } from '../domain/BottomBannerImage';
import type { BottomBannerRepository } from '../repository/BottomBannerRepository';

export class BottomBannerService {
  constructor(private readonly repository: BottomBannerRepository) {}

  async getBottomBanners(): Promise<BottomBannerImage[]> {
    return this.repository.findAll();
  }
}
