export interface VerifyReferralResult {
  exists: boolean;
  message: string;
}

export interface ReferralRepository {
  verifyByEmail(email: string): Promise<VerifyReferralResult>;
}
