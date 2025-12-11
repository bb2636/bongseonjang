import { UserProfile, Order } from '../domain/Profile';

export interface ProfileRepository {
  getUserProfile(userId: string): Promise<UserProfile | null>;
  getRecentOrders(userId: string, limit: number): Promise<Order[]>;
}
