import type { BongcookProduct, BongcookRepository } from './BongcookRepository';

const MOCK_BONGCOOK_PRODUCTS: BongcookProduct[] = [
  {
    id: 'dddd2222-2222-2222-2222-222222222222',
    name: '국산 명태살 500g',
    imageUrl: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400',
    originalPrice: 27300,
    discountPercent: 22,
    discountedPrice: 21900,
    isFavorite: false,
  },
  {
    id: 'cccc4444-4444-4444-4444-444444444444',
    name: '제주 돌김 선물세트',
    imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400',
    originalPrice: 35000,
    discountPercent: 15,
    discountedPrice: 29750,
    isFavorite: false,
  },
  {
    id: 'bbbb2222-2222-2222-2222-222222222222',
    name: '제주 은갈치 대 3마리',
    imageUrl: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400',
    originalPrice: 35000,
    discountPercent: 15,
    discountedPrice: 29750,
    isFavorite: true,
  },
  {
    id: 'bbbb3333-3333-3333-3333-333333333333',
    name: '완도 활전복 중 10미',
    imageUrl: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400',
    originalPrice: 45000,
    discountPercent: 20,
    discountedPrice: 36000,
    isFavorite: false,
  },
];

export class MockBongcookRepository implements BongcookRepository {
  async findAll(): Promise<BongcookProduct[]> {
    return MOCK_BONGCOOK_PRODUCTS;
  }
}
