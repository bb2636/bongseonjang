import type { TimeDeal } from '../domain/TimeDeal';
import type { TimeDealRepository } from './TimeDealRepository';

const TWO_DAYS_IN_MS = 2 * 24 * 60 * 60 * 1000;

function createEndTime(hoursFromNow: number): Date {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
}

const MOCK_TIME_DEALS: TimeDeal[] = [
  {
    id: '1',
    name: '알배기 암꽃게 간장게장',
    originalPrice: 28000,
    discountPercent: 22,
    discountedPrice: 21900,
    endTime: createEndTime(1),
  },
  {
    id: '2',
    name: '제주 은갈치 대 3마리',
    originalPrice: 35000,
    discountPercent: 15,
    discountedPrice: 29750,
    endTime: createEndTime(2),
  },
  {
    id: '3',
    name: '완도 활전복 중 10미',
    originalPrice: 45000,
    discountPercent: 20,
    discountedPrice: 36000,
    endTime: createEndTime(6),
  },
  {
    id: '4',
    name: '통영 생굴 1kg',
    originalPrice: 25000,
    discountPercent: 18,
    discountedPrice: 20500,
    endTime: createEndTime(12),
  },
  {
    id: '5',
    name: '노르웨이 생연어 500g',
    originalPrice: 32000,
    discountPercent: 25,
    discountedPrice: 24000,
    endTime: createEndTime(24),
  },
  {
    id: '6',
    name: '국산 킹크랩 2kg',
    originalPrice: 180000,
    discountPercent: 30,
    discountedPrice: 126000,
    endTime: createEndTime(36),
  },
  {
    id: '7',
    name: '자연산 광어회 500g',
    originalPrice: 55000,
    discountPercent: 15,
    discountedPrice: 46750,
    endTime: createEndTime(47),
  },
  {
    id: '8',
    name: '만료된 상품 (테스트)',
    originalPrice: 10000,
    discountPercent: 50,
    discountedPrice: 5000,
    endTime: createEndTime(-1),
  },
  {
    id: '9',
    name: '3일 후 종료 상품 (필터됨)',
    originalPrice: 20000,
    discountPercent: 10,
    discountedPrice: 18000,
    endTime: createEndTime(72),
  },
];

export class MockTimeDealRepository implements TimeDealRepository {
  async findActiveDeals(): Promise<TimeDeal[]> {
    const now = Date.now();
    const twoDaysLater = now + TWO_DAYS_IN_MS;

    return MOCK_TIME_DEALS.filter((deal) => {
      const endTimeMs = deal.endTime.getTime();
      return endTimeMs > now && endTimeMs <= twoDaysLater;
    }).sort((a, b) => a.endTime.getTime() - b.endTime.getTime());
  }
}
