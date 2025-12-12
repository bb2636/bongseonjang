import type { BadameunProduct, BadameunRepository } from './BadameunRepository';

const MOCK_BADAMEUN_PRODUCTS: BadameunProduct[] = [
  {
    id: 'bbbb6666-6666-6666-6666-666666666666',
    name: '국산 킹크랩 2kg',
    imageUrl: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=400',
    originalPrice: 180000,
    discountPercent: 30,
    discountedPrice: 126000,
    isFavorite: true,
  },
  {
    id: 'bbbb7777-7777-7777-7777-777777777777',
    name: '자연산 광어회 500g',
    imageUrl: 'https://images.unsplash.com/photo-1579631542720-3a87824fff86?w=400',
    originalPrice: 55000,
    discountPercent: 15,
    discountedPrice: 46750,
    isFavorite: false,
  },
  {
    id: 'bbbb8888-8888-8888-8888-888888888888',
    name: '울릉도 오징어 10마리',
    imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400',
    originalPrice: 18000,
    discountPercent: 15,
    discountedPrice: 15300,
    isFavorite: false,
  },
  {
    id: 'dddd1111-1111-1111-1111-111111111111',
    name: '통영 자연산 홍합',
    imageUrl: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400',
    originalPrice: 27300,
    discountPercent: 22,
    discountedPrice: 21900,
    isFavorite: false,
  },
];

export class MockBadameunRepository implements BadameunRepository {
  async findAll(): Promise<BadameunProduct[]> {
    return MOCK_BADAMEUN_PRODUCTS;
  }
}
