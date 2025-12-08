import { EmailVerificationRepository } from '../repository';
import { sendVerificationEmail, generateVerificationCode } from '../services';

const VERIFICATION_EXPIRY_MINUTES = 3;

export class EmailVerificationService {
  private repository: EmailVerificationRepository;

  constructor() {
    this.repository = new EmailVerificationRepository();
  }

  async sendVerificationCode(email: string): Promise<{ success: boolean; message: string }> {
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY_MINUTES * 60 * 1000);

    await this.repository.create(email, code, expiresAt);

    await sendVerificationEmail(email, code);

    return {
      success: true,
      message: '인증코드를 발송했습니다',
    };
  }

  async verifyCode(email: string, code: string): Promise<{ success: boolean; message: string }> {
    const token = await this.repository.findByEmailAndCode(email, code);

    if (!token) {
      return {
        success: false,
        message: '인증코드가 올바르지 않습니다',
      };
    }

    if (token.isVerified) {
      return {
        success: false,
        message: '이미 사용된 인증코드입니다',
      };
    }

    if (new Date() > token.expiresAt) {
      return {
        success: false,
        message: '인증코드가 만료되었습니다',
      };
    }

    await this.repository.markAsVerified(token.id);

    return {
      success: true,
      message: '이메일 인증이 완료되었습니다',
    };
  }

  async isEmailVerified(email: string): Promise<boolean> {
    const token = await this.repository.findLatestByEmail(email);
    return token?.isVerified === true;
  }
}
