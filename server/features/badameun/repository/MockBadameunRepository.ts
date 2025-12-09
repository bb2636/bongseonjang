import type { BadameunProduct, BadameunRepository } from './BadameunRepository';

const MOCK_BADAMEUN_PRODUCTS: BadameunProduct[] = [
  {
    id: 'badameun-1',
    name: '알배기 암꽃게 간장게장 알배기 암꽃게 간장게장',
    imageUrl: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400',
    originalPrice: 27300,
    discountPercent: 22,
    discountedPrice: 21900,
    isFavorite: false,
  },
  {
    id: 'badameun-2',
    name: '프리미엄 새우장 특대 사이즈',
    imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400',
    originalPrice: 35000,
    discountPercent: 15,
    discountedPrice: 29750,
    isFavorite: false,
  },
  {
    id: 'badameun-3',
    name: '전복장 명품 세트',
    imageUrl: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400',
    originalPrice: 45000,
    discountPercent: 18,
    discountedPrice: 36900,
    isFavorite: true,
  },
  {
    id: 'badameun-4',
    name: '연어장 프리미엄',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    originalPrice: 32000,
    discountPercent: 20,
    discountedPrice: 25600,
    isFavorite: false,
  },
];

export class MockBadameunRepository implements BadameunRepository {
  async findAll(): Promise<BadameunProduct[]> {
    return MOCK_BADAMEUN_PRODUCTS;
  }
}
