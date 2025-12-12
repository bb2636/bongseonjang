import { ProfileRepository } from './ProfileRepository';
import { UserProfile, Order } from '../domain/Profile';

const MOCK_PROFILE: UserProfile = {
  id: 'user-1',
  name: '김블락',
  email: 'test@example.com',
  phone: '01012345678',
  grade: '실버',
  points: 15000,
  couponCount: 423,
  favoriteCount: 15,
  pendingReviewCount: 10,
};

const MOCK_ORDERS: Order[] = [
  {
    id: 'order-1',
    orderNumber: '20251211001234',
    orderDate: '2025.12.11',
    status: 'delivered',
    statusDate: '25.12.10 14:30',
    items: [
      {
        id: 'item-1',
        productId: 'product-1',
        productName: '중하 새우로 만든 살로만 새우장 양념 360g',
        imageUrl: 'https://placehold.co/62x62/f5f5f5/999999?text=Shrimp',
        quantity: 1,
        price: 12900,
      },
      {
        id: 'item-2',
        productId: 'product-2',
        productName: '봉선장 특제 간장게장 500g',
        imageUrl: 'https://placehold.co/62x62/f5f5f5/999999?text=Crab',
        quantity: 1,
        price: 25900,
      },
      {
        id: 'item-3',
        productId: 'product-3',
        productName: '제주 자연산 광어회 300g',
        imageUrl: 'https://placehold.co/62x62/f5f5f5/999999?text=Fish',
        quantity: 2,
        price: 35000,
      },
    ],
  },
  {
    id: 'order-2',
    orderNumber: '20251210005678',
    orderDate: '2025.12.10',
    status: 'shipping',
    statusDate: '배송중',
    items: [
      {
        id: 'item-4',
        productId: 'product-4',
        productName: '프리미엄 연어 스테이크 400g',
        imageUrl: 'https://placehold.co/62x62/f5f5f5/999999?text=Salmon',
        quantity: 1,
        price: 28900,
      },
    ],
  },
];

export class MockProfileRepository implements ProfileRepository {
  async getUserProfile(_userId: string): Promise<UserProfile | null> {
    return MOCK_PROFILE;
  }

  async getRecentOrders(_userId: string, limit: number): Promise<Order[]> {
    return MOCK_ORDERS.slice(0, limit);
  }

  async getUserPasswordHash(_userId: string): Promise<string | null> {
    return null;
  }

  async updateProfile(_userId: string, _data: any): Promise<void> {
    return;
  }

  async deleteUser(_userId: string): Promise<void> {
    return;
  }
}
