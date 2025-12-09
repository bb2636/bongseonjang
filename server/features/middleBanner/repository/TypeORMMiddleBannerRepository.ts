import type { MiddleBannerImage } from '../domain/MiddleBannerImage';
import type { MiddleBannerRepository } from './MiddleBannerRepository';

export class TypeORMMiddleBannerRepository implements MiddleBannerRepository {
  async findAll(): Promise<MiddleBannerImage[]> {
    throw new Error('TypeORMMiddleBannerRepository not implemented yet');
  }
}
