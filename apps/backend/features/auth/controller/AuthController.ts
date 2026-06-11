import crypto from 'crypto';
import { Request, Response } from 'express';
import * as jose from 'jose';
import { UserApplicationService } from '../application/UserApplicationService.js';
import { SocialAuthService } from '../domain/SocialAuthService.js';
import { getPhoneVerificationService } from '../application/phoneVerificationFactory.js';
import { AuthenticatedRequest } from '../../../common/middleware/authMiddleware.js';
import { SocialProvider, UserSocialAccount } from '../../../entity/UserSocialAccount.js';
import { LoginRequest, SignupRequest } from '@bongkru/contract';
import { oauthSessionStore, OAuthSessionData, pollingSessionStore } from '../domain/OAuthSessionStore.js';
import { AppDataSource } from '../../../config/database.js';

const userService = new UserApplicationService();
const socialAuthService = new SocialAuthService();
const phoneVerificationService = getPhoneVerificationService();

const DEMO_REVIEW_PHONE = (process.env.DEMO_REVIEW_PHONE ?? '01000000000').replace(/-/g, '');
const DEMO_REVIEW_CODE = '000000';

function isDemoReviewPhone(phone: string): boolean {
  return phone.replace(/-/g, '') === DEMO_REVIEW_PHONE;
}

function sendPollingCompleteHtml(res: Response, success: boolean, message: string): void {
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${success ? '로그인 완료' : '로그인 실패'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
    .container { text-align: center; padding: 40px 20px; }
    .icon { font-size: 64px; margin-bottom: 16px; }
    .message { color: #333; font-size: 18px; margin: 0 0 8px 0; font-weight: 600; }
    .hint { color: #666; font-size: 14px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">${success ? '✓' : '✕'}</div>
    <p class="message">${message}</p>
    <p class="hint">${success ? '이 창은 자동으로 닫힙니다' : '앱으로 돌아가서 다시 시도해주세요'}</p>
  </div>
</body>
</html>`;
  res.status(200).type('html').send(html);
}

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
      const { email, password, name, phone, referralId, zonecode, address, addressDetail } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ message: 'Email, password, and name are required' });
        return;
      }

      const result = await userService.register({ 
        email, 
        password, 
        name,
        phone,
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

      if (!socialUserInfo.email && provider !== 'apple') {
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
        email: socialUserInfo.email ?? null,
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
      console.log('[SMS] endpoint hit', req.body);
      const { phone } = req.body;

      if (!phone) {
        res.status(400).json({ success: false, message: '휴대폰 번호를 입력해주세요' });
        return;
      }

      if (!/^[0-9]{11}$/.test(phone.replace(/-/g, ''))) {
        res.status(400).json({ success: false, message: '올바른 휴대폰 번호를 입력해주세요' });
        return;
      }

      if (isDemoReviewPhone(phone)) {
        res.json({ success: true, message: '인증번호가 발송되었습니다' });
        return;
      }

      const result = await phoneVerificationService.sendCode(phone.replace(/-/g, ''));
      res.json(result);
    } catch (error) {
      console.error('[SMS ERROR] controller catch:', error);
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

      if (isDemoReviewPhone(phone) && code === DEMO_REVIEW_CODE) {
        res.json({ success: true, message: '인증이 완료되었습니다' });
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

      const sessionData = await oauthSessionStore.get(key);

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

    const handleAppleRedirect = async (sessionKey: string, originalState: string | undefined): Promise<void> => {
      if (originalState?.startsWith('polling:')) {
        const pollingSessionId = originalState.replace('polling:', '');
        const sessionData = await oauthSessionStore.get(sessionKey);

        if (sessionData?.token) {
          await pollingSessionStore.update(pollingSessionId, {
            status: 'completed',
            token: sessionData.token,
            isNewUser: sessionData.isNewUser,
            user: sessionData.user,
          });
          sendPollingCompleteHtml(res, true, '로그인 완료!');
        } else if (sessionData?.requiresEmail) {
          await pollingSessionStore.update(pollingSessionId, {
            status: 'completed',
            requiresEmail: true,
            provider: sessionData.provider,
            providerId: sessionData.providerId,
            name: sessionData.name,
          });
          sendPollingCompleteHtml(res, true, '로그인 완료!');
        } else {
          await pollingSessionStore.update(pollingSessionId, {
            status: 'error',
            error: sessionData?.error || 'unknown_error',
          });
          sendPollingCompleteHtml(res, false, '로그인에 실패했습니다');
        }
        return;
      }

      res.redirect(`${baseUrl}/social-callback?key=${sessionKey}`);
    };

    try {
      const { code, id_token, state, user } = req.body;
      const { originalState } = extractAppSchemeFromState(state);

      console.log('[Apple Callback] Received callback. State:', originalState, 'Has code:', !!code, 'Has id_token:', !!id_token, 'Has user:', !!user);

      const isPollingFlow = originalState?.startsWith('polling:');
      const stateValid = validateAndClearPendingAuthState(originalState);

      if (!originalState || (!stateValid && !isPollingFlow)) {
        console.warn(`[Apple Callback] Invalid or missing state. State: ${originalState}`);
        const sessionKey = await oauthSessionStore.save({ error: 'invalid_state', state: originalState });
        await handleAppleRedirect(sessionKey, originalState);
        return;
      }

      if (!stateValid && isPollingFlow) {
        const pollingSessionId = originalState!.replace('polling:', '');
        const pollingSession = await pollingSessionStore.check(pollingSessionId);
        if (!pollingSession) {
          console.warn('[Apple Callback] Polling session not found either, rejecting');
          const sessionKey = await oauthSessionStore.save({ error: 'invalid_state', state: originalState });
          await handleAppleRedirect(sessionKey, originalState);
          return;
        }
        console.log('[Apple Callback] State not in pendingAuthSessions but polling session exists, proceeding');
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
          console.error('[Apple Callback] Failed to parse Apple user data');
        }
      }

      if (!code) {
        console.error('[Apple Callback] No authorization code received');
        const sessionKey = await oauthSessionStore.save({ error: 'no_code', state: originalState });
        await handleAppleRedirect(sessionKey, originalState);
        return;
      }

      let socialUserInfo;
      try {
        socialUserInfo = await socialAuthService.getAppleUserInfo(code, id_token, userName);
        console.log('[Apple Callback] Got user info - provider:', socialUserInfo.provider, 'email:', socialUserInfo.email ? 'present' : 'missing', 'name:', socialUserInfo.name);
      } catch (tokenError) {
        const errorMsg = tokenError instanceof Error ? tokenError.message : String(tokenError);
        const errorStack = tokenError instanceof Error ? tokenError.stack : '';
        console.error('[Apple Callback] Token exchange error:', errorMsg);
        console.error('[Apple Callback] Token exchange stack:', errorStack);
        const sessionKey = await oauthSessionStore.save({ error: `token_exchange_failed: ${errorMsg}`, state: originalState });
        await handleAppleRedirect(sessionKey, originalState);
        return;
      }

      try {
        const result = await userService.socialLogin({
          provider: socialUserInfo.provider,
          providerUserId: socialUserInfo.providerUserId,
          email: socialUserInfo.email ?? null,
          name: socialUserInfo.name,
          profileImage: socialUserInfo.profileImage,
        });

        console.log('[Apple Callback] Social login success. isNewUser:', result.isNewUser, 'userId:', result.user.id);

        const sessionKey = await oauthSessionStore.save({
          token: result.token,
          isNewUser: result.isNewUser,
          state: originalState,
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
          },
        });
        await handleAppleRedirect(sessionKey, originalState);
      } catch (loginError) {
        const loginErrorMsg = loginError instanceof Error ? loginError.message : String(loginError);
        const loginErrorStack = loginError instanceof Error ? loginError.stack : '';
        console.error('[Apple Callback] Social login error:', loginErrorMsg);
        console.error('[Apple Callback] Social login stack:', loginErrorStack);
        const sessionKey = await oauthSessionStore.save({ error: `social_login_failed: ${loginErrorMsg}`, state: originalState });
        await handleAppleRedirect(sessionKey, originalState);
      }
    } catch (error) {
      const unexpectedMsg = error instanceof Error ? error.message : String(error);
      console.error('[Apple Callback] Unexpected error:', unexpectedMsg);
      try {
        const { state } = req.body || {};
        const { originalState } = extractAppSchemeFromState(state);
        const sessionKey = await oauthSessionStore.save({ error: `callback_error: ${unexpectedMsg.substring(0, 500)}`, state: originalState });
        await handleAppleRedirect(sessionKey, originalState);
      } catch (fallbackError) {
        console.error('[Apple Callback] Fallback error:', fallbackError);
        if (!res.headersSent) {
          res.redirect(`${baseUrl}/social-callback?error=apple_callback_failed`);
        }
      }
    }
  }

  async appleNativeCallback(req: Request, res: Response): Promise<void> {
    try {
      const { identityToken, authorizationCode, givenName, familyName, email } = req.body;

      console.log('[Apple Native] Callback received');
      console.log('[Apple Native] Has authorizationCode:', !!authorizationCode);
      console.log('[Apple Native] Has identityToken:', !!identityToken);
      console.log('[Apple Native] Email:', email);
      console.log('[Apple Native] givenName:', givenName);
      console.log('[Apple Native] familyName:', familyName);

      if (!authorizationCode) {
        res.status(400).json({ message: 'Authorization code is required' });
        return;
      }

      const socialUserInfo = await socialAuthService.verifyAppleNativeToken(
        authorizationCode,
        identityToken,
        givenName,
        familyName,
        email
      );

      console.log('[Apple Native] User info:', JSON.stringify(socialUserInfo));

      const result = await userService.socialLogin({
        provider: socialUserInfo.provider as any,
        providerUserId: socialUserInfo.providerUserId,
        email: socialUserInfo.email,
        name: socialUserInfo.name,
        profileImage: socialUserInfo.profileImage,
      });

      res.json(result);
    } catch (error) {
      console.error('[Apple Native] Error:', error);
      const message = error instanceof Error ? error.message : 'Apple native login failed';
      if (message === 'ACCOUNT_SUSPENDED') {
        res.status(403).json({ code: 'ACCOUNT_SUSPENDED', message: '활동이 제한된 계정입니다' });
        return;
      }
      res.status(400).json({ message });
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
      if (platform === 'app' && provider === 'google') {
        return `${APP_SCHEME}://oauth/${provider}/callback?key=${sessionKey}`;
      }
      return `${baseUrl}/social-callback?key=${sessionKey}`;
    };

    const sendDeepLinkPage = (targetUrl: string): void => {
      const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>로그인 처리 중...</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 40px 20px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e0e0e0;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .message { color: #666; margin: 0 0 24px 0; }
    .open-app-btn {
      display: none;
      background: #2563eb;
      color: white;
      border: none;
      padding: 16px 48px;
      font-size: 18px;
      font-weight: 600;
      border-radius: 12px;
      cursor: pointer;
      text-decoration: none;
      margin-top: 16px;
    }
    .open-app-btn:active {
      background: #1d4ed8;
    }
    .hint {
      color: #999;
      font-size: 14px;
      margin-top: 16px;
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner" id="spinner"></div>
    <p class="message" id="message">앱으로 이동 중...</p>
    <a href="${targetUrl}" class="open-app-btn" id="openAppBtn">앱 열기</a>
    <p class="hint" id="hint">버튼을 눌러 앱으로 이동해주세요</p>
  </div>
  <script>
    (function() {
      var targetUrl = "${targetUrl}";
      var redirectAttempted = false;
      
      console.log('[OAuth Redirect] Target URL:', targetUrl);
      
      function showButton() {
        document.getElementById('spinner').style.display = 'none';
        document.getElementById('message').textContent = '로그인 완료!';
        document.getElementById('openAppBtn').style.display = 'inline-block';
        document.getElementById('hint').style.display = 'block';
      }
      
      function tryRedirect() {
        if (redirectAttempted) return;
        redirectAttempted = true;
        
        try {
          window.location.href = targetUrl;
        } catch (e) {
          console.log('[OAuth Redirect] location.href failed:', e);
        }
      }
      
      // Try immediate redirect
      tryRedirect();
      
      // Show button after 1.5 seconds as fallback (for iOS Safari)
      setTimeout(function() {
        showButton();
      }, 1500);
      
      // Handle visibility change (user might have switched to app and back)
      document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
          // User left this page, likely opened the app
          console.log('[OAuth Redirect] Page hidden, app likely opened');
        }
      });
    })();
  </script>
</body>
</html>`;
      res.status(200).type('html').send(html);
    };

    const sendPollingCompletePage = (success: boolean, message: string): void => {
      const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${success ? '로그인 완료' : '로그인 실패'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 40px 20px;
    }
    .icon {
      font-size: 64px;
      margin-bottom: 16px;
    }
    .message { 
      color: #333; 
      font-size: 18px;
      margin: 0 0 8px 0; 
      font-weight: 600;
    }
    .hint {
      color: #666;
      font-size: 14px;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">${success ? '✓' : '✕'}</div>
    <p class="message">${message}</p>
    <p class="hint">${success ? '이 창은 자동으로 닫힙니다' : '앱으로 돌아가서 다시 시도해주세요'}</p>
  </div>
</body>
</html>`;
      res.status(200).type('html').send(html);
    };

    const doRedirect = async (provider: string, platform: string | undefined, sessionKey: string, originalState?: string): Promise<void> => {
      if (platform === 'polling' && originalState?.startsWith('polling:')) {
        const pollingSessionId = originalState.replace('polling:', '');
        const sessionData = await oauthSessionStore.get(sessionKey);
        
        if (sessionData?.token) {
          await pollingSessionStore.update(pollingSessionId, {
            status: 'completed',
            token: sessionData.token,
            isNewUser: sessionData.isNewUser,
            user: sessionData.user,
          });
          console.log('[Polling OAuth] Session completed:', pollingSessionId);
          sendPollingCompletePage(true, '로그인 완료!');
        } else if (sessionData?.requiresEmail) {
          await pollingSessionStore.update(pollingSessionId, {
            status: 'completed',
            requiresEmail: true,
            provider: sessionData.provider,
            providerId: sessionData.providerId,
            name: sessionData.name,
          });
          console.log('[Polling OAuth] Session requires email:', pollingSessionId);
          sendPollingCompletePage(true, '로그인 완료!');
        } else if (sessionData?.error) {
          await pollingSessionStore.update(pollingSessionId, {
            status: 'error',
            error: sessionData.error,
          });
          console.log('[Polling OAuth] Session error:', pollingSessionId, sessionData.error);
          sendPollingCompletePage(false, '로그인에 실패했습니다');
        } else {
          await pollingSessionStore.update(pollingSessionId, {
            status: 'error',
            error: 'unknown_error',
          });
          sendPollingCompletePage(false, '알 수 없는 오류가 발생했습니다');
        }
        return;
      }

      const redirectUrl = getRedirectUrl(provider, platform, sessionKey);
      console.log(`[OAuth Callback] Redirecting to: ${redirectUrl}`);
      
      if (platform === 'app' && provider === 'google') {
        sendDeepLinkPage(redirectUrl);
      } else {
        res.redirect(redirectUrl);
      }
    };

    try {
      const provider = req.params.provider as string;
      const { code, state, error: oauthError } = req.query;
      const { originalState } = extractAppSchemeFromState(state as string | undefined);

      const pendingSession = originalState ? pendingAuthSessions.get(originalState) : undefined;
      let platform = pendingSession?.platform;
      if (!platform && originalState?.startsWith('polling:')) {
        platform = 'polling';
      }
      console.log(`[OAuth Callback] Provider: ${provider}, Platform: ${platform}, State: ${originalState}`);

      if (oauthError) {
        const sessionKey = await oauthSessionStore.save({ error: oauthError as string, state: originalState });
        await doRedirect(provider, platform, sessionKey, originalState);
        return;
      }

      const isPollingFlow = originalState?.startsWith('polling:');
      if (!originalState || (!validateAndClearPendingAuthState(originalState) && !isPollingFlow)) {
        console.warn(`[OAuth Callback] Invalid or missing state. State: ${originalState}, Provider: ${provider}`);
        const sessionKey = await oauthSessionStore.save({ error: 'invalid_state', state: originalState });
        await doRedirect(provider, platform, sessionKey, originalState);
        return;
      }

      if (!code) {
        const sessionKey = await oauthSessionStore.save({ error: 'no_code', state: originalState });
        await doRedirect(provider, platform, sessionKey, originalState);
        return;
      }

      const validProviders = ['kakao', 'naver', 'google', 'apple'];
      if (!validProviders.includes(provider)) {
        const sessionKey = await oauthSessionStore.save({ error: 'invalid_provider', state: originalState });
        await doRedirect(provider, platform, sessionKey, originalState);
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
        } else if (provider === 'apple') {
          socialUserInfo = await socialAuthService.getAppleUserInfo(code as string, undefined, undefined, '/api/auth/oauth/apple/callback');
        }
      } catch (tokenError) {
        console.error('Token exchange error:', tokenError);
        const sessionKey = await oauthSessionStore.save({ error: 'token_exchange_failed', state: originalState });
        await doRedirect(provider, platform, sessionKey, originalState);
        return;
      }

      if (!socialUserInfo) {
        const sessionKey = await oauthSessionStore.save({ error: 'user_info_failed', state: originalState });
        await doRedirect(provider, platform, sessionKey, originalState);
        return;
      }

      if (!socialUserInfo.email) {
        const sessionKey = await oauthSessionStore.save({
          requiresEmail: true,
          provider: socialUserInfo.provider,
          providerId: socialUserInfo.providerUserId,
          name: socialUserInfo.name,
          state: originalState,
        });
        await doRedirect(provider, platform, sessionKey, originalState);
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

        const sessionKey = await oauthSessionStore.save({
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
        await doRedirect(provider, platform, sessionKey, originalState);
      } catch (loginError) {
        console.error('Social login error:', loginError);
        const errorMessage = loginError instanceof Error ? loginError.message : 'login_failed';
        const sessionKey = await oauthSessionStore.save({ error: errorMessage, state: originalState });
        await doRedirect(provider, platform, sessionKey, originalState);
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      const provider = req.params.provider as string;
      const { state } = req.query;
      const { originalState: catchOriginalState } = extractAppSchemeFromState(state as string | undefined);
      const pendingSession = catchOriginalState ? pendingAuthSessions.get(catchOriginalState) : undefined;
      const sessionKey = await oauthSessionStore.save({ error: 'callback_failed', state: catchOriginalState });
      await doRedirect(provider, pendingSession?.platform, sessionKey, catchOriginalState);
    }
  }

  // Create a polling session for deep-link-free OAuth flow
  async createPollingSession(req: Request, res: Response): Promise<void> {
    const sessionId = await pollingSessionStore.create();
    console.log('[Polling OAuth] Created session:', sessionId);
    res.status(200).json({ sessionId });
  }

  async checkPollingSession(req: Request, res: Response): Promise<void> {
    const { sessionId } = req.params;
    const session = await pollingSessionStore.check(sessionId);
    
    if (!session) {
      res.status(404).json({ error: 'Session not found or expired' });
      return;
    }

    if (session.status === 'completed') {
      const data = await pollingSessionStore.consume(sessionId);
      res.status(200).json(data);
      return;
    }

    res.status(200).json({ status: session.status });
  }

  // Start OAuth flow with polling session
  async startPollingOAuth(req: Request, res: Response): Promise<void> {
    const provider = req.params.provider as string;
    const { pollingSessionId } = req.query;

    if (!pollingSessionId) {
      res.status(400).json({ error: 'pollingSessionId is required' });
      return;
    }

    const socialRedirectBase = process.env.VITE_SOCIAL_REDIRECT_BASE_URL || process.env.SOCIAL_REDIRECT_BASE_URL;
    const baseUrl = socialRedirectBase || (process.env.REPLIT_DEPLOYMENT_URL
      ? `https://${process.env.REPLIT_DEPLOYMENT_URL}`
      : process.env.REPLIT_DEV_DOMAIN
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : `${req.protocol}://${req.get('host')}`);

    try {
      // Store the polling session ID in state
      const stateData = `polling:${pollingSessionId}`;
      pendingAuthSessions.set(stateData, {
        state: stateData,
        platform: 'polling',
        createdAt: Date.now()
      });

      const redirectUri = `${baseUrl}/api/auth/oauth/${provider}/callback`;
      let authUrl: string;

      if (provider === 'kakao') {
        const clientId = process.env.KAKAO_REST_API_KEY;
        if (!clientId) throw new Error('KAKAO_REST_API_KEY not configured');
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          state: stateData,
        });
        authUrl = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
      } else if (provider === 'naver') {
        const clientId = process.env.NAVER_CLIENT_ID;
        if (!clientId) throw new Error('NAVER_CLIENT_ID not configured');
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          state: stateData,
        });
        authUrl = `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
      } else if (provider === 'google') {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) throw new Error('GOOGLE_CLIENT_ID not configured');
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'email profile',
          state: stateData,
          access_type: 'offline',
          prompt: 'consent',
        });
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      } else if (provider === 'apple') {
        const clientId = process.env.APPLE_CLIENT_ID;
        if (!clientId) throw new Error('APPLE_CLIENT_ID not configured');
        const appleRedirectUri = `${baseUrl}/api/auth/apple/callback`;
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: appleRedirectUri,
          response_type: 'code id_token',
          scope: 'name email',
          state: stateData,
          response_mode: 'form_post',
        });
        authUrl = `https://appleid.apple.com/auth/authorize?${params.toString()}`;
      } else {
        res.status(400).json({ error: 'Unsupported provider for polling OAuth' });
        return;
      }
      
      console.log('[Polling OAuth] Starting OAuth for provider:', provider);
      console.log('[Polling OAuth] Polling session ID:', pollingSessionId);
      console.log('[Polling OAuth] Auth URL:', authUrl);
      
      res.json({ authUrl });
    } catch (error) {
      console.error('[Polling OAuth] Error starting OAuth:', error);
      res.status(500).json({ error: 'Failed to start OAuth' });
    }
  }

  async appleNotifications(req: Request, res: Response): Promise<void> {
    console.log('[Apple S2S Notification] Received notification');

    try {
      const { payload } = req.body;

      if (!payload) {
        console.warn('[Apple S2S Notification] No payload in request body');
        res.status(200).json({ ok: true });
        return;
      }

      const JWKS = jose.createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

      const appleClientId = process.env.APPLE_CLIENT_ID;
      const validAudiences: string[] = [];
      if (appleClientId) {
        validAudiences.push(appleClientId);
      }

      let jwtPayload: jose.JWTPayload;
      try {
        const { payload: verified } = await jose.jwtVerify(payload, JWKS, {
          issuer: 'https://appleid.apple.com',
        });

        const aud = typeof verified.aud === 'string' ? [verified.aud] : (verified.aud || []);
        const audMatch = aud.some((a) => validAudiences.includes(a));
        if (!audMatch) {
          console.warn('[Apple S2S Notification] Invalid audience:', verified.aud);
          res.status(200).json({ ok: true });
          return;
        }

        jwtPayload = verified;
      } catch (verifyError) {
        console.error('[Apple S2S Notification] JWT verification failed:', verifyError);
        res.status(200).json({ ok: true });
        return;
      }

      let events: { type?: string; sub?: string; email?: string; is_private_email?: string; event_time?: number };
      try {
        events = typeof jwtPayload.events === 'string'
          ? JSON.parse(jwtPayload.events as string)
          : (jwtPayload.events as any) || {};
      } catch (parseError) {
        console.error('[Apple S2S Notification] Failed to parse events field:', parseError);
        res.status(200).json({ ok: true });
        return;
      }

      const eventType = events.type;
      const sub = events.sub;
      const email = events.email;

      console.log(`[Apple S2S Notification] Event type: ${eventType}, sub: ${sub}, email: ${email}`);

      if (!eventType || !sub) {
        console.warn('[Apple S2S Notification] Missing event type or sub');
        res.status(200).json({ ok: true });
        return;
      }

      switch (eventType) {
        case 'consent-revoked':
        case 'account-delete': {
          console.log(`[Apple S2S Notification] Processing ${eventType} for sub: ${sub}`);
          try {
            const socialAccountRepo = AppDataSource.getRepository(UserSocialAccount);
            const account = await socialAccountRepo.findOne({
              where: { provider: 'apple' as SocialProvider, providerUserId: sub },
            });
            if (account) {
              await socialAccountRepo.remove(account);
              console.log(`[Apple S2S Notification] Deleted social account link for sub: ${sub}, userId: ${account.userId}`);
            } else {
              console.log(`[Apple S2S Notification] No social account found for sub: ${sub}`);
            }
          } catch (dbError) {
            console.error(`[Apple S2S Notification] Database error during ${eventType}:`, dbError);
          }
          break;
        }
        case 'email-disabled':
          console.log(`[Apple S2S Notification] Email relay disabled for sub: ${sub}, email: ${email}`);
          break;
        case 'email-enabled':
          console.log(`[Apple S2S Notification] Email relay enabled for sub: ${sub}, email: ${email}`);
          break;
        default:
          console.warn(`[Apple S2S Notification] Unknown event type: ${eventType}`);
          break;
      }

      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('[Apple S2S Notification] Unexpected error:', error);
      res.status(200).json({ ok: true });
    }
  }
}
