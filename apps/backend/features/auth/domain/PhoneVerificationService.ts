export interface SendCodeResult {
  success: boolean;
  message: string;
}

export interface VerifyCodeResult {
  success: boolean;
  message: string;
}

export interface PhoneVerificationService {
  sendCode(phone: string): Promise<SendCodeResult>;
  verifyCode(phone: string, code: string): Promise<VerifyCodeResult>;
}
