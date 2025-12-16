import type { HeroImage } from '../domain/HeroImage';
import type { HeroImageRepository } from '../repository/HeroImageRepository';

export class HeroImageApplicationService {
  constructor(private readonly heroImageRepository: HeroImageRepository) {}

  async getHeroImages(): Promise<HeroImage[]> {
    return this.heroImageRepository.findAll();
  }
}
