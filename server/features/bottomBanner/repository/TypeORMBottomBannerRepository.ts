import type { BottomBannerImage } from '../domain/BottomBannerImage';
import type { BottomBannerRepository } from './BottomBannerRepository';

export class TypeORMBottomBannerRepository implements BottomBannerRepository {
  async findAll(): Promise<BottomBannerImage[]> {
    return [];
  }
}
