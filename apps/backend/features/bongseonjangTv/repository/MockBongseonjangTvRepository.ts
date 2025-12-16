import type { BongseonjangTvImage } from '../domain/BongseonjangTvImage';
import type { BongseonjangTvRepository } from './BongseonjangTvRepository';

const MOCK_TV_IMAGES: BongseonjangTvImage[] = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800&h=420&fit=crop',
    linkUrl: undefined,
    order: 1,
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=420&fit=crop',
    linkUrl: undefined,
    order: 2,
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1518600506278-4e8ef466b810?w=800&h=420&fit=crop',
    linkUrl: undefined,
    order: 3,
  },
];

export class MockBongseonjangTvRepository implements BongseonjangTvRepository {
  async findAll(): Promise<BongseonjangTvImage[]> {
    return MOCK_TV_IMAGES.sort((a, b) => a.order - b.order);
  }
}
