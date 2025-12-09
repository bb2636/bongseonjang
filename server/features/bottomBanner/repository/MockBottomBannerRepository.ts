import type { BottomBannerImage } from '../domain/BottomBannerImage';
import type { BottomBannerRepository } from './BottomBannerRepository';

const MOCK_BOTTOM_BANNERS: BottomBannerImage[] = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=750&h=188&fit=crop',
    linkUrl: '/event/special-gift',
    order: 1,
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=750&h=188&fit=crop',
    linkUrl: '/event/membership',
    order: 2,
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=750&h=188&fit=crop',
    linkUrl: '/event/review-event',
    order: 3,
  },
];

export class MockBottomBannerRepository implements BottomBannerRepository {
  async findAll(): Promise<BottomBannerImage[]> {
    return MOCK_BOTTOM_BANNERS.sort((a, b) => a.order - b.order);
  }
}
