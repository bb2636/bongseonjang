import type { BottomBannerImage } from '../domain/BottomBannerImage';

export interface BottomBannerRepository {
  findAll(): Promise<BottomBannerImage[]>;
}
