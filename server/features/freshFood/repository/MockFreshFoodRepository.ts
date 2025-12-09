import type { FreshFood } from '../domain/FreshFood';
import type { FreshFoodRepository } from './FreshFoodRepository';

const MOCK_FRESH_FOODS: FreshFood[] = [
  {
    id: '1',
    name: '알배기 암꽃게 간장게장',
    imageUrl: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=335&h=350&fit=crop',
    originalPrice: 28000,
    discountPercent: 22,
    discountedPrice: 21900,
    isFavorite: false,
  },
  {
    id: '2',
    name: '국내산 손질 오징어 3마리',
    imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=335&h=350&fit=crop',
    originalPrice: 18000,
    discountPercent: 15,
    discountedPrice: 15300,
    isFavorite: true,
  },
  {
    id: '3',
    name: '완도 활전복 중 10미',
    imageUrl: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=335&h=350&fit=crop',
    originalPrice: 45000,
    discountPercent: 20,
    discountedPrice: 36000,
    isFavorite: false,
  },
  {
    id: '4',
    name: '제주 은갈치 대 3마리',
    imageUrl: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=335&h=350&fit=crop',
    originalPrice: 35000,
    discountPercent: 18,
    discountedPrice: 28700,
    isFavorite: false,
  },
  {
    id: '5',
    name: '노르웨이 생연어 500g',
    imageUrl: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=335&h=350&fit=crop',
    originalPrice: 32000,
    discountPercent: 25,
    discountedPrice: 24000,
    isFavorite: true,
  },
  {
    id: '6',
    name: '통영 생굴 1kg',
    imageUrl: 'https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=335&h=350&fit=crop',
    originalPrice: 25000,
    discountPercent: 12,
    discountedPrice: 22000,
    isFavorite: false,
  },
  {
    id: '7',
    name: '자연산 광어회 500g',
    imageUrl: 'https://images.unsplash.com/photo-1579631542720-3a87824fff86?w=335&h=350&fit=crop',
    originalPrice: 55000,
    discountPercent: 10,
    discountedPrice: 49500,
    isFavorite: false,
  },
  {
    id: '8',
    name: '국산 킹크랩 2kg',
    imageUrl: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=335&h=350&fit=crop',
    originalPrice: 180000,
    discountPercent: 30,
    discountedPrice: 126000,
    isFavorite: true,
  },
];

export class MockFreshFoodRepository implements FreshFoodRepository {
  async findAll(): Promise<FreshFood[]> {
    return MOCK_FRESH_FOODS;
  }
}
