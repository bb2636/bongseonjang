import { Request, Response } from 'express';
import { UserApplicationService } from '../application/UserApplicationService.js';
import { SocialAuthService } from '../domain/SocialAuthService.js';
import { AuthenticatedRequest } from '../../../common/middleware/authMiddleware.js';
import { SocialProvider } from '../../../entity/UserSocialAccount.js';
import { LoginRequest, SignupRequest } from '@bongkru/contract';

const userService = new UserApplicationService();
const socialAuthService = new SocialAuthService();

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
      res.status(401).json({ message });
    }
  }

  async socialLogin(req: Request, res: Response): Promise<void> {
    try {
      const { provider } = req.params;
      const { code, state } = req.body;

      if (!code) {
        res.status(400).json({ message: 'Authorization code is required' });
        return;
      }

      if (provider !== 'kakao' && provider !== 'naver') {
        res.status(400).json({ message: 'Invalid provider' });
        return;
      }

      let socialUserInfo;

      if (provider === 'kakao') {
        socialUserInfo = await socialAuthService.getKakaoUserInfo(code);
      } else {
        if (!state) {
          res.status(400).json({ message: 'State is required for Naver login' });
          return;
        }
        socialUserInfo = await socialAuthService.getNaverUserInfo(code, state);
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
      const message = error instanceof Error ? error.message : 'Social login failed';
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

      if (provider !== 'kakao' && provider !== 'naver') {
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

      if (provider !== 'kakao' && provider !== 'naver') {
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
}
