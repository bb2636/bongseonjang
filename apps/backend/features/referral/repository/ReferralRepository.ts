export interface VerifyReferralResult {
  exists: boolean;
  message: string;
}

export interface ReferralRepository {
  verifyById(referralId: string): Promise<VerifyReferralResult>;
}
