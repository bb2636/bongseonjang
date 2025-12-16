import type { BestProduct } from '../domain/BestProduct';
import type { BestProductRepository } from './BestProductRepository';

const MOCK_BEST_PRODUCTS: BestProduct[] = [
  {
    id: '1',
    name: '알배기 암꽃게 간장게장',
    imageUrl: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&h=280&fit=crop',
    originalPrice: 28000,
    discountPercent: 22,
    discountedPrice: 21900,
    rank: 1,
  },
  {
    id: '2',
    name: '제주 은갈치 대 3마리',
    imageUrl: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&h=280&fit=crop',
    originalPrice: 35000,
    discountPercent: 15,
    discountedPrice: 29750,
    rank: 2,
  },
  {
    id: '3',
    name: '완도 활전복 중 10미',
    imageUrl: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400&h=280&fit=crop',
    originalPrice: 45000,
    discountPercent: 20,
    discountedPrice: 36000,
    rank: 3,
  },
  {
    id: '4',
    name: '통영 생굴 1kg',
    imageUrl: 'https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=400&h=280&fit=crop',
    originalPrice: 25000,
    discountPercent: 18,
    discountedPrice: 20500,
    rank: 4,
  },
  {
    id: '5',
    name: '노르웨이 생연어 500g',
    imageUrl: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&h=280&fit=crop',
    originalPrice: 32000,
    discountPercent: 25,
    discountedPrice: 24000,
    rank: 5,
  },
  {
    id: '6',
    name: '국산 킹크랩 2kg',
    imageUrl: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=400&h=280&fit=crop',
    originalPrice: 180000,
    discountPercent: 30,
    discountedPrice: 126000,
    rank: 6,
  },
  {
    id: '7',
    name: '자연산 광어회 500g',
    imageUrl: 'https://images.unsplash.com/photo-1579631542720-3a87824fff86?w=400&h=280&fit=crop',
    originalPrice: 55000,
    discountPercent: 15,
    discountedPrice: 46750,
    rank: 7,
  },
  {
    id: '8',
    name: '울릉도 오징어 10마리',
    imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=280&fit=crop',
    originalPrice: 42000,
    discountPercent: 12,
    discountedPrice: 36960,
    rank: 8,
  },
];

export class MockBestProductRepository implements BestProductRepository {
  async findAll(): Promise<BestProduct[]> {
    return MOCK_BEST_PRODUCTS.sort((a, b) => a.rank - b.rank);
  }
}
