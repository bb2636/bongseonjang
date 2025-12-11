import { UserProfile, Order } from '../domain/Profile';

export interface UpdateProfileData {
  name: string;
  phone?: string;
  address?: string;
  addressDetail?: string;
  password?: string;
}

export interface ProfileRepository {
  getUserProfile(userId: string): Promise<UserProfile | null>;
  getRecentOrders(userId: string, limit: number): Promise<Order[]>;
  getUserPasswordHash(userId: string): Promise<string | null>;
  updateProfile(userId: string, data: UpdateProfileData): Promise<void>;
}
