import type { HeroImage } from '../domain/HeroImage';
import type { HeroImageRepository } from './HeroImageRepository';

export class TypeORMHeroImageRepository implements HeroImageRepository {
  async findAll(): Promise<HeroImage[]> {
    throw new Error('TypeORMHeroImageRepository not implemented yet');
  }
}
