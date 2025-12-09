import type { MiddleBannerImage } from '../domain/MiddleBannerImage';
import type { MiddleBannerRepository } from './MiddleBannerRepository';

const MOCK_MIDDLE_BANNERS: MiddleBannerImage[] = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=750&h=188&fit=crop',
    linkUrl: '/event/seafood-sale',
    order: 1,
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=750&h=188&fit=crop',
    linkUrl: '/event/new-arrival',
    order: 2,
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=750&h=188&fit=crop',
    linkUrl: '/event/weekend-deal',
    order: 3,
  },
];

export class MockMiddleBannerRepository implements MiddleBannerRepository {
  async findAll(): Promise<MiddleBannerImage[]> {
    return MOCK_MIDDLE_BANNERS.sort((a, b) => a.order - b.order);
  }
}
