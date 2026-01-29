import crypto from 'crypto';
import { Request, Response } from 'express';
import { UserApplicationService } from '../application/UserApplicationService.js';
import { SocialAuthService } from '../domain/SocialAuthService.js';
import { getPhoneVerificationService } from '../application/phoneVerificationFactory.js';
import { AuthenticatedRequest } from '../../../common/middleware/authMiddleware.js';
import { SocialProvider } from '../../../entity/UserSocialAccount.js';
import { LoginRequest, SignupRequest } from '@bongkru/contract';
import { oauthSessionStore, OAuthSessionData } from '../domain/OAuthSessionStore.js';

const userService = new UserApplicationService();
const socialAuthService = new SocialAuthService();
const phoneVerificationService = getPhoneVerificationService();

interface PendingAuthSession {
  state: string;
  platform?: string;
  createdAt: number;
}

export const pendingAuthSessions = new Map<string, PendingAuthSession>();

function cleanupPendingAuthSessions(): void {
  const TEN_MINUTES = 10 * 60 * 1000;
  const now = Date.now();
  for (const [key, session] of pendingAuthSessions.entries()) {
    if (now - session.createdAt > TEN_MINUTES) {
      pendingAuthSessions.delete(key);
    }
  }
}

function validateAndClearPendingAuthState(state: string | undefined): boolean {
  if (!state) {
    return false;
  }
  
  const session = pendingAuthSessions.get(state);
  if (!session) {
    return false;
  }
  
  pendingAuthSessions.delete(state);
  return true;
}

export class AuthController {
  async startOAuth(req: Request, res: Response): Promise<void> {
    const provider = req.params.provider as string;
    const platform = req.query.platform as string | undefined;
    
    const baseUrl = process.env.SOCIAL_REDIRECT_BASE_URL || process.env.VITE_SOCIAL_REDIRECT_BASE_URL || '';
    
    if (!baseUrl) {
      res.status(500).json({ error: 'Social redirect base URL not configured' });
      return;
    }
    
    const state = crypto.randomBytes(16).toString('hex');
    
    cleanupPendingAuthSessions();
    pendingAuthSessions.set(state, {
      state,
      platform,
      createdAt: Date.now(),
    });

    const redirectUri = `${baseUrl}/api/auth/oauth/${provider}/callback`;
    console.log(`[OAuth Start] Provider: ${provider}, Platform: ${platform}, State: ${state}`);
    console.log(`[OAuth Start] Redirect URI: ${redirectUri}`);

    let authUrl: string;

    if (provider === 'kakao') {
      const clientId = process.env.KAKAO_REST_API_KEY;
      if (!clientId) {
        res.status(500).json({ error: 'Kakao OAuth not configured' });
        return;
      }
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'profile_nickname,profile_image,account_email',
        state,
      });
      authUrl = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
    } else if (provider === 'naver') {
      const clientId = process.env.NAVER_CLIENT_ID;
      if (!clientId) {
        res.status(500).json({ error: 'Naver OAuth not configured' });
        return;
      }
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        state,
      });
      authUrl = `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
    } else if (provider === 'google') {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!clientId) {
        res.status(500).json({ error: 'Google OAuth not configured' });
        return;
      }
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        state,
        access_type: 'offline',
        prompt: 'consent',
      });
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    } else if (provider === 'apple') {
      const clientId = process.env.APPLE_CLIENT_ID;
      if (!clientId) {
        res.status(500).json({ error: 'Apple OAuth not configured' });
        return;
      }
      const appleRedirectUri = `${baseUrl}/api/auth/apple/callback`;
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: appleRedirectUri,
        response_type: 'code id_token',
        scope: 'name email',
        state,
        response_mode: 'form_post',
      });
      authUrl = `https://appleid.apple.com/auth/authorize?${params.toString()}`;
    } else {
      res.status(400).json({ error: 'Invalid provider' });
      return;
    }

    console.log(`[OAuth Start] Redirecting to: ${authUrl}`);
    res.redirect(authUrl);
  }

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
      const { code, state, redirectUri } = req.body;

      console.log('Code length:', code?.length);
      console.log('State:', state);
      console.log('RedirectUri from client:', redirectUri);

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
        socialUserInfo = await socialAuthService.getKakaoUserInfo(code, redirectUri);
        console.log('Kakao user info received:', JSON.stringify(socialUserInfo));
      } else if (provider === 'naver') {
        if (!state) {
          res.status(400).json({ message: 'State is required for Naver login' });
          return;
        }
        socialUserInfo = await socialAuthService.getNaverUserInfo(code, state, redirectUri);
      } else if (provider === 'google') {
        socialUserInfo = await socialAuthService.getGoogleUserInfo(code, redirectUri);
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

  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;

      if (!key) {
        res.status(400).json({ message: 'Session key is required' });
        return;
      }

      const sessionData = oauthSessionStore.get(key);

      if (!sessionData) {
        res.status(404).json({ message: 'Session not found or expired' });
        return;
      }

      res.json(sessionData);
    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({ message: 'Failed to get session' });
    }
  }

  async appleCallback(req: Request, res: Response): Promise<void> {
    const baseUrl = process.env.SOCIAL_REDIRECT_BASE_URL || process.env.VITE_SOCIAL_REDIRECT_BASE_URL || '';
    
    const extractAppSchemeFromState = (fullState: string | undefined): { originalState: string | undefined; appScheme: string | undefined } => {
      if (!fullState) return { originalState: undefined, appScheme: undefined };
      const parts = fullState.split('__scheme__');
      if (parts.length === 2) {
        return { originalState: parts[0], appScheme: parts[1] };
      }
      return { originalState: fullState, appScheme: undefined };
    };

    try {
      const { code, id_token, state, user } = req.body;
      const { originalState } = extractAppSchemeFromState(state);

      if (!originalState || !validateAndClearPendingAuthState(originalState)) {
        console.warn(`[Apple Callback] Invalid or missing state. State: ${originalState}`);
        const sessionKey = oauthSessionStore.save({ error: 'invalid_state', state: originalState });
        res.redirect(`${baseUrl}/social-callback?key=${sessionKey}`);
        return;
      }

      let userName: string | undefined;
      if (user) {
        try {
          const userJson = typeof user === 'string' ? JSON.parse(user) : user;
          if (userJson.name) {
            const firstName = userJson.name.firstName || '';
            const lastName = userJson.name.lastName || '';
            userName = `${lastName}${firstName}`.trim() || undefined;
          }
        } catch {
          console.error('Failed to parse Apple user data');
        }
      }

      if (!code) {
        const sessionKey = oauthSessionStore.save({ error: 'no_code', state: originalState });
        res.redirect(`${baseUrl}/social-callback?key=${sessionKey}`);
        return;
      }

      let socialUserInfo;
      try {
        socialUserInfo = await socialAuthService.getAppleUserInfo(code, id_token, userName);
      } catch (tokenError) {
        console.error('Apple token exchange error:', tokenError);
        const sessionKey = oauthSessionStore.save({ error: 'token_exchange_failed', state: originalState });
        res.redirect(`${baseUrl}/social-callback?key=${sessionKey}`);
        return;
      }

      if (!socialUserInfo.email) {
        const sessionKey = oauthSessionStore.save({
          requiresEmail: true,
          provider: socialUserInfo.provider,
          providerId: socialUserInfo.providerUserId,
          name: socialUserInfo.name,
          state: originalState,
        });
        res.redirect(`${baseUrl}/social-callback?key=${sessionKey}`);
        return;
      }

      try {
        const result = await userService.socialLogin({
          provider: socialUserInfo.provider,
          providerUserId: socialUserInfo.providerUserId,
          email: socialUserInfo.email,
          name: socialUserInfo.name,
          profileImage: socialUserInfo.profileImage,
        });

        const sessionKey = oauthSessionStore.save({
          token: result.token,
          isNewUser: result.isNewUser,
          state: originalState,
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
          },
        });
        res.redirect(`${baseUrl}/social-callback?key=${sessionKey}`);
      } catch (loginError) {
        console.error('Apple social login error:', loginError);
        const errorMessage = loginError instanceof Error ? loginError.message : 'login_failed';
        const sessionKey = oauthSessionStore.save({ error: errorMessage, state: originalState });
        res.redirect(`${baseUrl}/social-callback?key=${sessionKey}`);
      }
    } catch (error) {
      console.error('Apple callback error:', error);
      const { state } = req.body;
      const { originalState } = extractAppSchemeFromState(state);
      const sessionKey = oauthSessionStore.save({ error: 'callback_failed', state: originalState });
      res.redirect(`${baseUrl}/social-callback?key=${sessionKey}`);
    }
  }

  async oauthCallback(req: Request, res: Response): Promise<void> {
    const baseUrl = process.env.SOCIAL_REDIRECT_BASE_URL || process.env.VITE_SOCIAL_REDIRECT_BASE_URL || '';
    const APP_SCHEME = 'bongseonjang';

    const extractAppSchemeFromState = (fullState: string | undefined): { originalState: string | undefined; appScheme: string | undefined } => {
      if (!fullState) return { originalState: undefined, appScheme: undefined };
      const parts = fullState.split('__scheme__');
      if (parts.length === 2) {
        return { originalState: parts[0], appScheme: parts[1] };
      }
      return { originalState: fullState, appScheme: undefined };
    };

    const getRedirectUrl = (provider: string, platform: string | undefined, sessionKey: string): string => {
      if (platform === 'app') {
        return `${baseUrl}/social-callback?key=${sessionKey}&platform=app&provider=${provider}`;
      }
      return `${baseUrl}/social-callback?key=${sessionKey}`;
    };

    try {
      const provider = req.params.provider as string;
      const { code, state, error: oauthError } = req.query;
      const { originalState } = extractAppSchemeFromState(state as string | undefined);

      const pendingSession = originalState ? pendingAuthSessions.get(originalState) : undefined;
      const platform = pendingSession?.platform;
      console.log(`[OAuth Callback] Provider: ${provider}, Platform: ${platform}, State: ${originalState}`);

      if (oauthError) {
        const sessionKey = oauthSessionStore.save({ error: oauthError as string, state: originalState });
        res.redirect(getRedirectUrl(provider, platform, sessionKey));
        return;
      }

      if (!originalState || !validateAndClearPendingAuthState(originalState)) {
        console.warn(`[OAuth Callback] Invalid or missing state. State: ${originalState}, Provider: ${provider}`);
        const sessionKey = oauthSessionStore.save({ error: 'invalid_state', state: originalState });
        res.redirect(getRedirectUrl(provider, platform, sessionKey));
        return;
      }

      if (!code) {
        const sessionKey = oauthSessionStore.save({ error: 'no_code', state: originalState });
        res.redirect(getRedirectUrl(provider, platform, sessionKey));
        return;
      }

      const validProviders = ['kakao', 'naver', 'google'];
      if (!validProviders.includes(provider)) {
        const sessionKey = oauthSessionStore.save({ error: 'invalid_provider', state: originalState });
        res.redirect(getRedirectUrl(provider, platform, sessionKey));
        return;
      }

      let socialUserInfo;
      try {
        if (provider === 'kakao') {
          socialUserInfo = await socialAuthService.getKakaoUserInfo(code as string);
        } else if (provider === 'naver') {
          socialUserInfo = await socialAuthService.getNaverUserInfo(code as string, originalState as string);
        } else if (provider === 'google') {
          socialUserInfo = await socialAuthService.getGoogleUserInfo(code as string);
        }
      } catch (tokenError) {
        console.error('Token exchange error:', tokenError);
        const sessionKey = oauthSessionStore.save({ error: 'token_exchange_failed', state: originalState });
        res.redirect(getRedirectUrl(provider, platform, sessionKey));
        return;
      }

      if (!socialUserInfo) {
        const sessionKey = oauthSessionStore.save({ error: 'user_info_failed', state: originalState });
        res.redirect(getRedirectUrl(provider, platform, sessionKey));
        return;
      }

      if (!socialUserInfo.email) {
        const sessionKey = oauthSessionStore.save({
          requiresEmail: true,
          provider: socialUserInfo.provider,
          providerId: socialUserInfo.providerUserId,
          name: socialUserInfo.name,
          state: originalState,
        });
        res.redirect(getRedirectUrl(provider, platform, sessionKey));
        return;
      }

      try {
        const result = await userService.socialLogin({
          provider: socialUserInfo.provider,
          providerUserId: socialUserInfo.providerUserId,
          email: socialUserInfo.email,
          name: socialUserInfo.name,
          profileImage: socialUserInfo.profileImage,
        });

        const sessionKey = oauthSessionStore.save({
          token: result.token,
          isNewUser: result.isNewUser,
          state: originalState,
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
          },
        });
        console.log(`[OAuth Callback] Success! Redirecting to: ${getRedirectUrl(provider, platform, sessionKey)}`);
        res.redirect(getRedirectUrl(provider, platform, sessionKey));
      } catch (loginError) {
        console.error('Social login error:', loginError);
        const errorMessage = loginError instanceof Error ? loginError.message : 'login_failed';
        const sessionKey = oauthSessionStore.save({ error: errorMessage, state: originalState });
        res.redirect(getRedirectUrl(provider, platform, sessionKey));
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      const provider = req.params.provider as string;
      const { state } = req.query;
      const { originalState } = extractAppSchemeFromState(state as string | undefined);
      const pendingSession = originalState ? pendingAuthSessions.get(originalState) : undefined;
      const sessionKey = oauthSessionStore.save({ error: 'callback_failed', state: originalState });
      res.redirect(getRedirectUrl(provider, pendingSession?.platform, sessionKey));
    }
  }
}
