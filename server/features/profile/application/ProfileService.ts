import bcrypt from 'bcrypt';
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

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const passwordHash = await this.profileRepository.getUserPasswordHash(userId);
    
    if (!passwordHash) {
      return false;
    }

    return bcrypt.compare(password, passwordHash);
  }
}
