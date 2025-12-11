import { ProfileRepository } from '../repository/ProfileRepository';
import { UserProfile, Order } from '../domain/Profile';

export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.profileRepository.getUserProfile(userId);
  }

  async getRecentOrders(userId: string, limit: number = 3): Promise<Order[]> {
    return this.profileRepository.getRecentOrders(userId, limit);
  }
}
