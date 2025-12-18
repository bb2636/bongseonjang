import type { HeroImage } from '../domain/HeroImage';
import type { HeroImageRepository } from './HeroImageRepository';

const MOCK_HERO_IMAGES: HeroImage[] = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1518600506278-4e8ef466b810?w=800&h=500&fit=crop',
    linkUrl: undefined,
    order: 1,
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800&h=500&fit=crop',
    linkUrl: undefined,
    order: 2,
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=500&fit=crop',
    linkUrl: undefined,
    order: 3,
  },
];

export class MockHeroImageRepository implements HeroImageRepository {
  async findAll(): Promise<HeroImage[]> {
    return MOCK_HERO_IMAGES.sort((a, b) => a.order - b.order);
  }
}
