import type { MiddleBannerRepository } from '../repository/MiddleBannerRepository';
import type { MiddleBannerImage } from '../domain/MiddleBannerImage';

export class MiddleBannerService {
  constructor(private readonly repository: MiddleBannerRepository) {}

  async getMiddleBanners(): Promise<MiddleBannerImage[]> {
    return this.repository.findAll();
  }
}
