interface VerifyReferralResult {
  exists: boolean;
  message: string;
}

const MOCK_EXISTING_EMAIL = "test@test.com";

export class ReferralApplicationService {
  async verifyReferralId(referralId: string): Promise<VerifyReferralResult> {
    if (referralId === MOCK_EXISTING_EMAIL) {
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
