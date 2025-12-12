import type { TimeDeal } from '../domain/TimeDeal';
import type { TimeDealRepository } from './TimeDealRepository';

const TWO_DAYS_IN_MS = 2 * 24 * 60 * 60 * 1000;

function createMockDeals(): TimeDeal[] {
  const now = Date.now();
  return [
    {
      id: 'deal-1',
      productId: 'bbbb2222-2222-2222-2222-222222222222',
      name: '제주 은갈치 대 3마리',
      imageUrl: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=300&h=200&fit=crop',
      originalPrice: 35000,
      discountPercent: 15,
      discountedPrice: 29750,
      endTime: new Date(now + 1 * 60 * 60 * 1000),
    },
    {
      id: 'deal-2',
      productId: 'bbbb3333-3333-3333-3333-333333333333',
      name: '완도 활전복 중 10미',
      imageUrl: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=300&h=200&fit=crop',
      originalPrice: 45000,
      discountPercent: 20,
      discountedPrice: 36000,
      endTime: new Date(now + 2 * 60 * 60 * 1000),
    },
    {
      id: 'deal-3',
      productId: 'bbbb4444-4444-4444-4444-444444444444',
      name: '통영 생굴 1kg',
      imageUrl: 'https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=300&h=200&fit=crop',
      originalPrice: 25000,
      discountPercent: 18,
      discountedPrice: 20500,
      endTime: new Date(now + 6 * 60 * 60 * 1000),
    },
    {
      id: 'deal-4',
      productId: 'bbbb5555-5555-5555-5555-555555555555',
      name: '노르웨이 생연어 500g',
      imageUrl: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=300&h=200&fit=crop',
      originalPrice: 32000,
      discountPercent: 25,
      discountedPrice: 24000,
      endTime: new Date(now + 12 * 60 * 60 * 1000),
    },
    {
      id: 'deal-5',
      productId: 'bbbb6666-6666-6666-6666-666666666666',
      name: '국산 킹크랩 2kg',
      imageUrl: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=300&h=200&fit=crop',
      originalPrice: 180000,
      discountPercent: 30,
      discountedPrice: 126000,
      endTime: new Date(now + 24 * 60 * 60 * 1000),
    },
    {
      id: 'deal-6',
      productId: 'bbbb7777-7777-7777-7777-777777777777',
      name: '자연산 광어회 500g',
      imageUrl: 'https://images.unsplash.com/photo-1579631542720-3a87824fff86?w=300&h=200&fit=crop',
      originalPrice: 55000,
      discountPercent: 15,
      discountedPrice: 46750,
      endTime: new Date(now + 36 * 60 * 60 * 1000),
    },
  ];
}

export class MockTimeDealRepository implements TimeDealRepository {
  async findActiveDeals(): Promise<TimeDeal[]> {
    const now = Date.now();
    const twoDaysLater = now + TWO_DAYS_IN_MS;
    const mockDeals = createMockDeals();

    return mockDeals.filter((deal) => {
      const endTimeMs = deal.endTime.getTime();
      return endTimeMs > now && endTimeMs <= twoDaysLater;
    }).sort((a, b) => a.endTime.getTime() - b.endTime.getTime());
  }
}
