import { Request, Response } from 'express';
import { EmailVerificationService } from '../application/EmailVerificationService';

export class EmailVerificationController {
  private service: EmailVerificationService;

  constructor() {
    this.service = new EmailVerificationService();
  }

  async sendCode(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email || typeof email !== 'string') {
        res.status(400).json({
          success: false,
          message: '이메일을 입력해주세요',
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: '올바른 이메일 형식이 아닙니다',
        });
        return;
      }

      const result = await this.service.sendVerificationCode(email);
      res.status(200).json(result);
    } catch (error) {
      console.error('Send verification code error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '서버 오류가 발생했습니다',
      });
    }
  }

  async verifyCode(req: Request, res: Response): Promise<void> {
    try {
      const { email, code } = req.body;

      if (!email || typeof email !== 'string') {
        res.status(400).json({
          success: false,
          message: '이메일을 입력해주세요',
        });
        return;
      }

      if (!code || typeof code !== 'string') {
        res.status(400).json({
          success: false,
          message: '인증코드를 입력해주세요',
        });
        return;
      }

      const result = await this.service.verifyCode(email, code);
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Verify code error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '서버 오류가 발생했습니다',
      });
    }
  }
}
