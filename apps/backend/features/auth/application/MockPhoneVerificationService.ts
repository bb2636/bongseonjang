import type { PhoneVerificationService, SendCodeResult, VerifyCodeResult } from '../domain/PhoneVerificationService';

interface StoredCode {
  code: string;
  expiresAt: Date;
}

const CODE_EXPIRY_MINUTES = 3;

export class MockPhoneVerificationService implements PhoneVerificationService {
  private codes = new Map<string, StoredCode>();

  async sendCode(phone: string): Promise<SendCodeResult> {
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

    this.codes.set(phone, { code, expiresAt });
    
    console.log(`[Mock SMS] ${phone}: 인증번호 ${code}`);

    return { 
      success: true, 
      message: '인증번호가 발송되었습니다',
      devCode: code
    };
  }

  async verifyCode(phone: string, code: string): Promise<VerifyCodeResult> {
    const stored = this.codes.get(phone);

    if (!stored) {
      return { 
        success: false, 
        message: '인증번호를 먼저 요청해주세요' 
      };
    }

    if (new Date() > stored.expiresAt) {
      this.codes.delete(phone);
      return { 
        success: false, 
        message: '인증번호가 만료되었습니다' 
      };
    }

    if (stored.code !== code) {
      return { 
        success: false, 
        message: '인증번호가 일치하지 않습니다' 
      };
    }

    this.codes.delete(phone);
    return { 
      success: true, 
      message: '인증이 완료되었습니다' 
    };
  }

  private generateCode(): string {
    return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
  }
}
