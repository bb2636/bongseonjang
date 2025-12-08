import { AppDataSource } from '../config/database';
import { User } from '../entity/User';
import { ReferralRepository, VerifyReferralResult } from './ReferralRepository';

export class TypeORMReferralRepository implements ReferralRepository {
  async verifyByEmail(email: string): Promise<VerifyReferralResult> {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ email });

    if (user) {
      return {
        exists: true,
        message: '추천인 아이디가 확인되었습니다.',
      };
    }

    return {
      exists: false,
      message: '입력하신 아이디를 확인해주세요',
    };
  }
}
