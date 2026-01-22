import { Request, Response } from 'express';
import { UserApplicationService } from '../application/UserApplicationService.js';
import { SocialAuthService } from '../domain/SocialAuthService.js';
import { getPhoneVerificationService } from '../application/phoneVerificationFactory.js';
import { AuthenticatedRequest } from '../../../common/middleware/authMiddleware.js';
import { SocialProvider } from '../../../entity/UserSocialAccount.js';
import { LoginRequest, SignupRequest } from '@bongkru/contract';

const userService = new UserApplicationService();
const socialAuthService = new SocialAuthService();
const phoneVerificationService = getPhoneVerificationService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, phone, birthDate, gender, referralId, zonecode, address, addressDetail } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ message: 'Email, password, and name are required' });
        return;
      }

      const result = await userService.register({ 
        email, 
        password, 
        name,
        phone,
        birthDate,
        gender,
        referralId,
        zonecode,
        address,
        addressDetail,
      });
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      res.status(400).json({ message });
    }
  }

  async checkEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
      }

      const exists = await userService.checkEmailExists(email);
      res.json({ exists });
    } catch (error) {
      res.status(500).json({ message: 'Failed to check email' });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }

      const result = await userService.login({ email, password });
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      if (message === 'ACCOUNT_SUSPENDED') {
        res.status(403).json({ code: 'ACCOUNT_SUSPENDED', message: '활동이 제한된 계정입니다' });
        return;
      }
      res.status(401).json({ message });
    }
  }

  async adminLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요' });
        return;
      }

      const result = await userService.adminLogin({ email, password });
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : '로그인에 실패했습니다';
      res.status(401).json({ error: message });
    }
  }

  async socialLogin(req: Request, res: Response): Promise<void> {
    console.log('=== socialLogin called ===');
    console.log('Provider:', req.params.provider);
    console.log('Body:', JSON.stringify(req.body));
    
    try {
      const { provider } = req.params;
      const { code, state } = req.body;

      console.log('Code length:', code?.length);
      console.log('State:', state);

      if (!code) {
        console.log('ERROR: No code provided');
        res.status(400).json({ message: 'Authorization code is required' });
        return;
      }

      const validProviders = ['kakao', 'naver', 'google', 'apple'];
      if (!validProviders.includes(provider)) {
        res.status(400).json({ message: 'Invalid provider' });
        return;
      }

      let socialUserInfo;

      console.log('Calling socialAuthService for provider:', provider);

      if (provider === 'kakao') {
        console.log('Getting Kakao user info...');
        socialUserInfo = await socialAuthService.getKakaoUserInfo(code);
        console.log('Kakao user info received:', JSON.stringify(socialUserInfo));
      } else if (provider === 'naver') {
        if (!state) {
          res.status(400).json({ message: 'State is required for Naver login' });
          return;
        }
        socialUserInfo = await socialAuthService.getNaverUserInfo(code, state);
      } else if (provider === 'google') {
        socialUserInfo = await socialAuthService.getGoogleUserInfo(code);
      } else if (provider === 'apple') {
        const { idToken, userName } = req.body;
        socialUserInfo = await socialAuthService.getAppleUserInfo(code, idToken, userName);
      } else {
        res.status(400).json({ message: 'Invalid provider' });
        return;
      }

      if (!socialUserInfo.email) {
        res.status(200).json({ 
          success: false,
          requiresEmail: true,
          tempData: {
            provider: socialUserInfo.provider,
            providerUserId: socialUserInfo.providerUserId,
            name: socialUserInfo.name,
            profileImage: socialUserInfo.profileImage,
          }
        });
        return;
      }

      const result = await userService.socialLogin({
        provider: socialUserInfo.provider,
        providerUserId: socialUserInfo.providerUserId,
        email: socialUserInfo.email,
        name: socialUserInfo.name,
        profileImage: socialUserInfo.profileImage,
      });

      res.json(result);
    } catch (error) {
      console.error('=== socialLogin ERROR ===');
      console.error('Error:', error);
      const message = error instanceof Error ? error.message : 'Social login failed';
      if (message === 'ACCOUNT_SUSPENDED') {
        res.status(403).json({ code: 'ACCOUNT_SUSPENDED', message: '활동이 제한된 계정입니다' });
        return;
      }
      res.status(400).json({ message });
    }
  }

  async completeSocialLogin(req: Request, res: Response): Promise<void> {
    try {
      const { provider, providerUserId, email, name, profileImage } = req.body;

      if (!provider || !providerUserId || !email || !name) {
        res.status(400).json({ message: 'All fields are required' });
        return;
      }

      const validProviders = ['kakao', 'naver', 'google', 'apple'];
      if (!validProviders.includes(provider)) {
        res.status(400).json({ message: 'Invalid provider' });
        return;
      }

      const result = await userService.socialLogin({
        provider: provider as SocialProvider,
        providerUserId,
        email,
        name,
        profileImage,
      });

      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Social login failed';
      if (message === 'ACCOUNT_SUSPENDED') {
        res.status(403).json({ code: 'ACCOUNT_SUSPENDED', message: '활동이 제한된 계정입니다' });
        return;
      }
      res.status(400).json({ message });
    }
  }

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const user = await userService.getUserById(req.userId);

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  }

  async getLinkedAccounts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const accounts = await userService.getLinkedSocialAccounts(req.userId);
      res.json({ accounts });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch linked accounts' });
    }
  }

  async unlinkAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const { provider } = req.params;

      const validProviders = ['kakao', 'naver', 'google', 'apple'];
      if (!validProviders.includes(provider)) {
        res.status(400).json({ message: 'Invalid provider' });
        return;
      }

      await userService.unlinkSocialAccount(req.userId, provider as SocialProvider);
      res.json({ message: 'Account unlinked successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to unlink account';
      res.status(400).json({ message });
    }
  }

  async completeSocialProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const { name, phone, birthDate, gender, referralId, addressName, zonecode, address, addressDetail } = req.body;

      if (!name) {
        res.status(400).json({ message: 'Name is required' });
        return;
      }

      await userService.completeSocialProfile(req.userId, {
        name,
        phone,
        birthDate,
        gender,
        referralId,
        addressName,
        zonecode,
        address,
        addressDetail,
      });

      res.json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete profile';
      res.status(400).json({ message });
    }
  }

  async sendPhoneVerificationCode(req: Request, res: Response): Promise<void> {
    try {
      const { phone } = req.body;

      if (!phone) {
        res.status(400).json({ success: false, message: '휴대폰 번호를 입력해주세요' });
        return;
      }

      if (!/^[0-9]{11}$/.test(phone.replace(/-/g, ''))) {
        res.status(400).json({ success: false, message: '올바른 휴대폰 번호를 입력해주세요' });
        return;
      }

      const result = await phoneVerificationService.sendCode(phone.replace(/-/g, ''));
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: '인증번호 발송에 실패했습니다' });
    }
  }

  async verifyPhoneCode(req: Request, res: Response): Promise<void> {
    try {
      const { phone, code } = req.body;

      if (!phone || !code) {
        res.status(400).json({ success: false, message: '휴대폰 번호와 인증번호를 입력해주세요' });
        return;
      }

      const result = await phoneVerificationService.verifyCode(phone.replace(/-/g, ''), code);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: '인증번호 확인에 실패했습니다' });
    }
  }
}
