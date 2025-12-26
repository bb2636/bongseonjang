import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../../../config/database.js';
import { User } from '../../../entity/User.js';
import { EmailVerificationToken } from '../../../entity/EmailVerificationToken.js';

const router = Router();

router.post('/request', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: '이메일을 입력해주세요' });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      res.json({ success: true, message: '재설정 링크가 이메일로 발송되었습니다' });
      return;
    }

    const tokenRepository = AppDataSource.getRepository(EmailVerificationToken);
    
    await tokenRepository.delete({ email });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const verificationToken = tokenRepository.create({
      email,
      code: token,
      expiresAt,
      isVerified: false,
    });

    await tokenRepository.save(verificationToken);

    console.log('===========================================');
    console.log('비밀번호 재설정 토큰 (SI 과제용 - 실제 이메일 발송 대신 콘솔 출력)');
    console.log(`이메일: ${email}`);
    console.log(`토큰: ${token}`);
    console.log(`만료시간: ${expiresAt.toISOString()}`);
    console.log(`재설정 링크: /login/password-reset/confirm?token=${token}`);
    console.log('===========================================');

    res.json({ success: true, message: '재설정 링크가 이메일로 발송되었습니다' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ success: false, message: '비밀번호 재설정 요청에 실패했습니다' });
  }
});

router.post('/confirm', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ success: false, message: '토큰과 새 비밀번호를 입력해주세요' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: '비밀번호는 6자 이상이어야 합니다' });
      return;
    }

    const tokenRepository = AppDataSource.getRepository(EmailVerificationToken);
    const verificationToken = await tokenRepository.findOne({ where: { code: token } });

    if (!verificationToken) {
      res.status(400).json({ success: false, message: '유효하지 않은 토큰입니다' });
      return;
    }

    if (verificationToken.expiresAt < new Date()) {
      await tokenRepository.delete({ id: verificationToken.id });
      res.status(400).json({ success: false, message: '토큰이 만료되었습니다' });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email: verificationToken.email } });

    if (!user) {
      res.status(400).json({ success: false, message: '사용자를 찾을 수 없습니다' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.update(user.id, { password: hashedPassword });

    await tokenRepository.delete({ id: verificationToken.id });

    res.json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다' });
  } catch (error) {
    console.error('Password reset confirm error:', error);
    res.status(500).json({ success: false, message: '비밀번호 변경에 실패했습니다' });
  }
});

export default router;
