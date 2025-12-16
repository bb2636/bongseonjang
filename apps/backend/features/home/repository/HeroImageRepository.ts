import type { HeroImage } from '../domain/HeroImage';

export interface HeroImageRepository {
  findAll(): Promise<HeroImage[]>;
}
