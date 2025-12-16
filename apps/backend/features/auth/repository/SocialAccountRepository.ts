import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { UserSocialAccount, SocialProvider } from '../../../entity/UserSocialAccount';

export class SocialAccountRepository {
  private repository: Repository<UserSocialAccount>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserSocialAccount);
  }

  async findByProviderAndProviderId(
    provider: SocialProvider,
    providerUserId: string
  ): Promise<UserSocialAccount | null> {
    return this.repository.findOne({
      where: { provider, providerUserId },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<UserSocialAccount[]> {
    return this.repository.find({
      where: { userId },
    });
  }

  async create(data: Partial<UserSocialAccount>): Promise<UserSocialAccount> {
    const socialAccount = this.repository.create(data);
    return this.repository.save(socialAccount);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }

  async deleteByUserIdAndProvider(
    userId: string,
    provider: SocialProvider
  ): Promise<boolean> {
    const result = await this.repository.delete({ userId, provider });
    return result.affected !== 0;
  }
}
