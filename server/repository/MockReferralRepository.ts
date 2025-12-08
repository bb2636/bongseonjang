import { ReferralRepository, VerifyReferralResult } from './ReferralRepository';

const MOCK_EXISTING_EMAILS = ['test@test.com', 'friend@example.com'];

export class MockReferralRepository implements ReferralRepository {
  async verifyByEmail(email: string): Promise<VerifyReferralResult> {
    const exists = MOCK_EXISTING_EMAILS.includes(email);

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
