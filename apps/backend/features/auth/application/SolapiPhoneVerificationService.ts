import { SolapiMessageService } from 'solapi';
import type { PhoneVerificationService, SendCodeResult, VerifyCodeResult } from '../domain/PhoneVerificationService.js';

interface StoredCode {
  code: string;
  expiresAt: Date;
  attempts: number;
}

const CODE_EXPIRY_MINUTES = 3;
const MAX_VERIFY_ATTEMPTS = 5;

export class SolapiPhoneVerificationService implements PhoneVerificationService {
  private codes = new Map<string, StoredCode>();
  private messageService: SolapiMessageService;
  private senderPhone: string;

  constructor() {
    const apiKey = process.env.SOLAPI_API_KEY;
    const apiSecret = process.env.SOLAPI_API_SECRET;
    const senderPhone = process.env.SOLAPI_SENDER_PHONE;

    if (!apiKey || !apiSecret || !senderPhone) {
      throw new Error('Solapi 환경변수가 설정되지 않았습니다 (SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER_PHONE)');
    }

    this.messageService = new SolapiMessageService(apiKey, apiSecret);
    this.senderPhone = senderPhone.replace(/-/g, '');
  }

  async sendCode(phone: string): Promise<SendCodeResult> {
    const normalizedPhone = phone.replace(/-/g, '');
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

    try {
      await this.messageService.send({
        to: normalizedPhone,
        from: this.senderPhone,
        text: `[봉선장] 인증번호 [${code}]를 입력해주세요.`,
      });

      this.codes.set(normalizedPhone, { code, expiresAt, attempts: 0 });

      return {
        success: true,
        message: '인증번호가 발송되었습니다',
      };
    } catch (error) {
      console.error('SMS 발송 실패:', error);
      return {
        success: false,
        message: 'SMS 발송에 실패했습니다. 잠시 후 다시 시도해주세요.',
      };
    }
  }

  async verifyCode(phone: string, code: string): Promise<VerifyCodeResult> {
    const normalizedPhone = phone.replace(/-/g, '');
    const stored = this.codes.get(normalizedPhone);

    if (!stored) {
      return {
        success: false,
        message: '인증번호를 먼저 요청해주세요',
      };
    }

    if (new Date() > stored.expiresAt) {
      this.codes.delete(normalizedPhone);
      return {
        success: false,
        message: '인증번호가 만료되었습니다',
      };
    }

    if (stored.attempts >= MAX_VERIFY_ATTEMPTS) {
      this.codes.delete(normalizedPhone);
      return {
        success: false,
        message: '인증 시도 횟수를 초과했습니다. 다시 인증번호를 요청해주세요.',
      };
    }

    if (stored.code !== code) {
      stored.attempts += 1;
      return {
        success: false,
        message: '인증번호가 일치하지 않습니다',
      };
    }

    this.codes.delete(normalizedPhone);
    return {
      success: true,
      message: '인증이 완료되었습니다',
    };
  }

  private generateCode(): string {
    return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
  }
}
