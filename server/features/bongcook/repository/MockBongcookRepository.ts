import type { BongcookProduct, BongcookRepository } from './BongcookRepository';

const MOCK_BONGCOOK_PRODUCTS: BongcookProduct[] = [
  {
    id: 'bongcook-1',
    name: '알배기 암꽃게 간장게장 알배기 암꽃게 간장게장',
    imageUrl: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400',
    originalPrice: 27300,
    discountPercent: 22,
    discountedPrice: 21900,
    isFavorite: false,
  },
  {
    id: 'bongcook-2',
    name: '프리미엄 봉쿡 세트',
    imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400',
    originalPrice: 35000,
    discountPercent: 15,
    discountedPrice: 29750,
    isFavorite: false,
  },
  {
    id: 'bongcook-3',
    name: '봉쿡 스페셜 도시락',
    imageUrl: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400',
    originalPrice: 45000,
    discountPercent: 18,
    discountedPrice: 36900,
    isFavorite: true,
  },
  {
    id: 'bongcook-4',
    name: '봉쿡 프리미엄 정식',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    originalPrice: 32000,
    discountPercent: 20,
    discountedPrice: 25600,
    isFavorite: false,
  },
];

export class MockBongcookRepository implements BongcookRepository {
  async findAll(): Promise<BongcookProduct[]> {
    return MOCK_BONGCOOK_PRODUCTS;
  }
}
