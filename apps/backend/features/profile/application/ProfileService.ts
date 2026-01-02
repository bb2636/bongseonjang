import bcrypt from 'bcrypt';
import { ProfileRepository } from '../repository/ProfileRepository';
import { UserProfile, Order } from '../domain/Profile';

export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.profileRepository.getUserProfile(userId);
  }

  async getRecentOrders(userId: string, limit: number = 3, onlyInProgress: boolean = false): Promise<Order[]> {
    return this.profileRepository.getRecentOrders(userId, limit, onlyInProgress);
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const passwordHash = await this.profileRepository.getUserPasswordHash(userId);
    
    if (!passwordHash) {
      return false;
    }

    return bcrypt.compare(password, passwordHash);
  }

  async updateProfile(userId: string, data: {
    name: string;
    phone?: string;
    birthDate?: string | null;
    gender?: string | null;
    isMarketingEmail?: boolean;
    isMarketingSms?: boolean;
    address?: string;
    addressDetail?: string;
    newPassword?: string;
  }): Promise<void> {
    let hashedPassword: string | undefined;
    
    if (data.newPassword) {
      hashedPassword = await bcrypt.hash(data.newPassword, 10);
    }

    await this.profileRepository.updateProfile(userId, {
      name: data.name,
      phone: data.phone,
      birthDate: data.birthDate,
      gender: data.gender,
      isMarketingEmail: data.isMarketingEmail,
      isMarketingSms: data.isMarketingSms,
      address: data.address,
      addressDetail: data.addressDetail,
      password: hashedPassword,
    });
  }

  async withdrawAccount(userId: string): Promise<void> {
    await this.profileRepository.deleteUser(userId);
  }
}
