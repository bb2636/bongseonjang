import { ReferralRepository, VerifyReferralResult } from '../repository/ReferralRepository';

export class ReferralApplicationService {
  constructor(private referralRepository: ReferralRepository) {}

  async verifyReferralId(referralId: string): Promise<VerifyReferralResult> {
    return this.referralRepository.verifyByEmail(referralId);
  }
}
