import type { MiddleBannerImage } from '../domain/MiddleBannerImage';

export interface MiddleBannerRepository {
  findAll(): Promise<MiddleBannerImage[]>;
}
