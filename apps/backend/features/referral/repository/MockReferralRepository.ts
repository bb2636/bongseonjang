import { ReferralRepository, VerifyReferralResult } from './ReferralRepository';

const MOCK_REGISTERED_USERS = ['test@test.com', 'friend@example.com'];

export class MockReferralRepository implements ReferralRepository {
  async verifyById(referralId: string): Promise<VerifyReferralResult> {
    const exists = MOCK_REGISTERED_USERS.includes(referralId);

    if (exists) {
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
