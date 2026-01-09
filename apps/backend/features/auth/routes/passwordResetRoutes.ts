import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../../../config/database.js';
import { User } from '../../../entity/User.js';
import { UserSocialAccount } from '../../../entity/UserSocialAccount.js';
import { EmailVerificationToken } from '../../../entity/EmailVerificationToken.js';
import { sendPasswordResetEmail, generateVerificationCode } from '../../../common/services/emailService.js';

const router = Router();

const VERIFICATION_EXPIRY_MINUTES = 3;

router.post('/check-email', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: '이메일을 입력해주세요' });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      res.json({ 
        success: false, 
        exists: false,
        isSocialOnlyAccount: false,
        provider: null,
        message: '가입되지 않은 이메일입니다'
      });
      return;
    }

    const hasPassword = user.password !== null && user.password !== '';

    if (!hasPassword) {
      const socialAccountRepository = AppDataSource.getRepository(UserSocialAccount);
      const socialAccount = await socialAccountRepository.findOne({ 
        where: { userId: user.id } 
      });

      if (socialAccount) {
        res.json({ 
          success: false,
          exists: true,
          isSocialOnlyAccount: true, 
          provider: socialAccount.provider,
          message: `${socialAccount.provider === 'kakao' ? '카카오톡' : '네이버'} 간편 가입으로 가입한 계정입니다`
        });
        return;
      }
    }

    res.json({ 
      success: true,
      exists: true,
      isSocialOnlyAccount: false, 
      provider: null,
      message: '확인되었습니다'
    });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ success: false, message: '계정 확인에 실패했습니다' });
  }
});

router.post('/send-code', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: '이메일을 입력해주세요' });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      res.status(400).json({ success: false, message: '가입되지 않은 이메일입니다' });
      return;
    }

    const tokenRepository = AppDataSource.getRepository(EmailVerificationToken);
    
    await tokenRepository.delete({ email });

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY_MINUTES * 60 * 1000);

    const verificationToken = tokenRepository.create({
      email,
      code,
      expiresAt,
      isVerified: false,
    });

    await tokenRepository.save(verificationToken);

    await sendPasswordResetEmail(email, code);

    res.json({ 
      success: true, 
      message: '인증코드가 발송되었습니다',
      expiresInSeconds: VERIFICATION_EXPIRY_MINUTES * 60
    });
  } catch (error) {
    console.error('Send code error:', error);
    res.status(500).json({ success: false, message: '인증코드 발송에 실패했습니다' });
  }
});

router.post('/verify-code', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({ success: false, message: '이메일과 인증코드를 입력해주세요' });
      return;
    }

    const tokenRepository = AppDataSource.getRepository(EmailVerificationToken);
    const verificationToken = await tokenRepository.findOne({ 
      where: { email, code } 
    });

    if (!verificationToken) {
      res.status(400).json({ success: false, message: '인증코드가 올바르지 않습니다' });
      return;
    }

    if (verificationToken.isVerified) {
      res.status(400).json({ success: false, message: '이미 사용된 인증코드입니다' });
      return;
    }

    if (verificationToken.expiresAt < new Date()) {
      await tokenRepository.delete({ id: verificationToken.id });
      res.status(400).json({ success: false, message: '인증코드가 만료되었습니다' });
      return;
    }

    await tokenRepository.update(verificationToken.id, { isVerified: true });

    res.json({ success: true, message: '인증이 완료되었습니다' });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ success: false, message: '인증코드 확인에 실패했습니다' });
  }
});

router.post('/change-password', async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    if (!email || !code || !newPassword) {
      res.status(400).json({ success: false, message: '모든 필드를 입력해주세요' });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ success: false, message: '비밀번호가 일치하지 않습니다' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: '비밀번호는 6자 이상이어야 합니다' });
      return;
    }

    const tokenRepository = AppDataSource.getRepository(EmailVerificationToken);
    const verificationToken = await tokenRepository.findOne({ 
      where: { email, code, isVerified: true } 
    });

    if (!verificationToken) {
      res.status(400).json({ success: false, message: '인증이 완료되지 않았습니다' });
      return;
    }

    if (verificationToken.expiresAt < new Date()) {
      await tokenRepository.delete({ id: verificationToken.id });
      res.status(400).json({ success: false, message: '인증 세션이 만료되었습니다. 다시 시도해주세요.' });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      res.status(400).json({ success: false, message: '사용자를 찾을 수 없습니다' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.update(user.id, { password: hashedPassword });

    await tokenRepository.delete({ id: verificationToken.id });

    res.json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: '비밀번호 변경에 실패했습니다' });
  }
});

router.post('/check-social', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: '이메일을 입력해주세요' });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      res.json({ isSocialOnlyAccount: false, provider: null });
      return;
    }

    const hasPassword = user.password !== null && user.password !== '';

    if (hasPassword) {
      res.json({ isSocialOnlyAccount: false, provider: null });
      return;
    }

    const socialAccountRepository = AppDataSource.getRepository(UserSocialAccount);
    const socialAccount = await socialAccountRepository.findOne({ 
      where: { userId: user.id } 
    });

    if (socialAccount) {
      res.json({ 
        isSocialOnlyAccount: true, 
        provider: socialAccount.provider 
      });
      return;
    }

    res.json({ isSocialOnlyAccount: false, provider: null });
  } catch (error) {
    console.error('Check social account error:', error);
    res.status(500).json({ success: false, message: '계정 확인에 실패했습니다' });
  }
});

export default router;
