import { SocialProvider } from '../../../entity/UserSocialAccount';
import jwt from 'jsonwebtoken';
import * as jose from 'jose';

interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

interface KakaoUserResponse {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
}

interface NaverTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface NaverUserResponse {
  response: {
    id: string;
    email?: string;
    name?: string;
    nickname?: string;
    profile_image?: string;
  };
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  id_token: string;
}

interface GoogleUserResponse {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

interface AppleTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  id_token: string;
}

interface AppleIdTokenPayload {
  sub: string;
  email?: string;
  email_verified?: string | boolean;
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
}

export interface SocialUserInfo {
  provider: SocialProvider;
  providerUserId: string;
  email: string | null;
  name: string;
  profileImage: string | null;
}

export class SocialAuthService {
  async getKakaoUserInfo(code: string, clientRedirectUri?: string): Promise<SocialUserInfo> {
    console.log('=== getKakaoUserInfo START ===');
    
    const clientId = process.env.KAKAO_REST_API_KEY;
    const clientSecret = process.env.KAKAO_CLIENT_SECRET;
    const baseUrl = process.env.VITE_SOCIAL_REDIRECT_BASE_URL || process.env.SOCIAL_REDIRECT_BASE_URL;
    const redirectUri = clientRedirectUri || `${baseUrl}/api/auth/oauth/kakao/callback`;

    console.log('Environment check:');
    console.log('- KAKAO_REST_API_KEY:', clientId ? `${clientId.substring(0, 8)}...` : 'NOT SET');
    console.log('- KAKAO_CLIENT_SECRET:', clientSecret ? 'SET' : 'NOT SET');
    console.log('- SOCIAL_REDIRECT_BASE_URL:', baseUrl);
    console.log('- Full redirect_uri:', redirectUri);
    console.log('- Code length:', code?.length);

    if (!clientId || !redirectUri) {
      console.error('Missing OAuth config!');
      throw new Error('Kakao OAuth configuration is missing');
    }

    console.log('Sending token request to Kakao...');
    
    const params: Record<string, string> = {
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code,
    };
    
    if (clientSecret) {
      params.client_secret = clientSecret;
    }
    
    console.log('Token request params:', { ...params, code: `${code.substring(0, 20)}...` });
    
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: new URLSearchParams(params).toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Kakao token error:', tokenResponse.status, errorData);
      console.error('Request params:', { clientId, redirectUri, codeLength: code?.length });
      throw new Error(`Failed to get Kakao access token: ${errorData}`);
    }

    const tokenData = await tokenResponse.json() as KakaoTokenResponse;

    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get Kakao user info');
    }

    const userData = await userResponse.json() as KakaoUserResponse;

    return {
      provider: 'kakao',
      providerUserId: String(userData.id),
      email: userData.kakao_account?.email || null,
      name: userData.kakao_account?.profile?.nickname || '카카오 사용자',
      profileImage: userData.kakao_account?.profile?.profile_image_url || null,
    };
  }

  async getNaverUserInfo(code: string, state: string, clientRedirectUri?: string): Promise<SocialUserInfo> {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    console.log('[Naver OAuth] === Token Exchange Start ===');
    console.log('[Naver OAuth] client_id:', clientId ? `${clientId.substring(0, 8)}...` : 'MISSING');
    console.log('[Naver OAuth] client_secret:', clientSecret ? `${clientSecret.substring(0, 4)}...` : 'MISSING');
    console.log('[Naver OAuth] code:', code ? `${code.substring(0, 10)}...` : 'MISSING');
    console.log('[Naver OAuth] state:', state);

    if (!clientId || !clientSecret) {
      throw new Error('Naver OAuth configuration is missing');
    }

    const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        state,
      }),
    });

    const tokenData = await tokenResponse.json() as NaverTokenResponse;
    console.log('[Naver OAuth] Token Response Status:', tokenResponse.status);
    console.log('[Naver OAuth] Token Response:', JSON.stringify(tokenData, null, 2));

    if (!tokenResponse.ok || tokenData.error) {
      console.error('[Naver OAuth] Token Error:', tokenData.error, tokenData.error_description);
      throw new Error(`Failed to get Naver access token: ${tokenData.error_description || tokenData.error}`);
    }

    const userResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get Naver user info');
    }

    const userData = await userResponse.json() as NaverUserResponse;

    return {
      provider: 'naver',
      providerUserId: userData.response.id,
      email: userData.response.email || null,
      name: userData.response.name || userData.response.nickname || '네이버 사용자',
      profileImage: userData.response.profile_image || null,
    };
  }

  async getGoogleUserInfo(code: string, clientRedirectUri?: string): Promise<SocialUserInfo> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const baseUrl = process.env.SOCIAL_REDIRECT_BASE_URL || process.env.VITE_SOCIAL_REDIRECT_BASE_URL;
    const redirectUri = clientRedirectUri || `${baseUrl}/api/auth/oauth/google/callback`;

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth configuration is missing');
    }

    if (!baseUrl) {
      throw new Error('SOCIAL_REDIRECT_BASE_URL is not configured');
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Google token error:', tokenResponse.status, errorData);
      throw new Error(`Failed to get Google access token: ${errorData}`);
    }

    const tokenData = await tokenResponse.json() as GoogleTokenResponse;

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get Google user info');
    }

    const userData = await userResponse.json() as GoogleUserResponse;

    return {
      provider: 'google',
      providerUserId: userData.sub,
      email: userData.email || null,
      name: userData.name || '구글 사용자',
      profileImage: userData.picture || null,
    };
  }

  async getAppleUserInfo(code: string, idToken?: string, userName?: string, callbackPath?: string): Promise<SocialUserInfo> {
    const clientId = process.env.APPLE_CLIENT_ID;
    const teamId = process.env.APPLE_TEAM_ID;
    const keyId = process.env.APPLE_KEY_ID;
    const privateKey = process.env.APPLE_PRIVATE_KEY;
    const baseUrl = process.env.SOCIAL_REDIRECT_BASE_URL || process.env.VITE_SOCIAL_REDIRECT_BASE_URL;
    const redirectUri = `${baseUrl}${callbackPath || '/api/auth/apple/callback'}`;

    if (!clientId || !teamId || !keyId || !privateKey) {
      throw new Error('Apple OAuth configuration is missing');
    }

    if (!baseUrl) {
      throw new Error('SOCIAL_REDIRECT_BASE_URL is not configured');
    }

    const clientSecret = this.generateAppleClientSecret(clientId, teamId, keyId, privateKey);

    const tokenResponse = await fetch('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Apple token error:', tokenResponse.status, errorData);
      throw new Error(`Failed to get Apple access token: ${errorData}`);
    }

    const tokenData = await tokenResponse.json() as AppleTokenResponse;
    
    const verifiedPayload = await this.verifyAppleIdToken(tokenData.id_token, clientId);

    return {
      provider: 'apple',
      providerUserId: verifiedPayload.sub,
      email: verifiedPayload.email || null,
      name: userName || '애플 사용자',
      profileImage: null,
    };
  }

  private async verifyAppleIdToken(idToken: string, clientId: string): Promise<AppleIdTokenPayload> {
    const JWKS = jose.createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

    try {
      const { payload } = await jose.jwtVerify(idToken, JWKS, {
        issuer: 'https://appleid.apple.com',
        audience: clientId,
      });

      console.log('[AppleAuth] id_token verified payload:', {
        iss: payload.iss,
        aud: payload.aud,
        sub: payload.sub,
        email: payload.email,
        email_verified: payload.email_verified,
      });

      if (!payload.sub) {
        throw new Error('Apple ID token missing sub claim');
      }

      return {
        sub: payload.sub,
        email: payload.email as string | undefined,
        email_verified: payload.email_verified as boolean | undefined,
        iss: payload.iss as string,
        aud: payload.aud as string,
        exp: payload.exp as number,
        iat: payload.iat as number,
      };
    } catch (error) {
      console.error('Apple ID token verification failed:', error);
      throw new Error('Failed to verify Apple ID token');
    }
  }

  async verifyAppleNativeToken(
    authorizationCode: string,
    identityToken?: string,
    givenName?: string,
    familyName?: string,
    email?: string
  ): Promise<SocialUserInfo> {
    const BUNDLE_ID = 'com.bongkru.app';
    const teamId = process.env.APPLE_TEAM_ID;
    const keyId = process.env.APPLE_KEY_ID;
    const privateKey = process.env.APPLE_PRIVATE_KEY;

    console.log('[AppleNative] === Token Exchange Start ===');
    console.log('[AppleNative] authorizationCode length:', authorizationCode?.length);
    console.log('[AppleNative] Has identityToken:', !!identityToken);
    console.log('[AppleNative] Email:', email);
    console.log('[AppleNative] givenName:', givenName, 'familyName:', familyName);

    if (!teamId || !keyId || !privateKey) {
      throw new Error('Apple OAuth configuration is missing');
    }

    const clientSecret = this.generateAppleClientSecret(BUNDLE_ID, teamId, keyId, privateKey);

    console.log('[AppleNative] Token exchange params:', {
      grant_type: 'authorization_code',
      client_id: BUNDLE_ID,
      code_length: authorizationCode?.length,
    });

    const tokenResponse = await fetch('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: BUNDLE_ID,
        client_secret: clientSecret,
        code: authorizationCode,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('[AppleNative] Token exchange error:', tokenResponse.status, errorData);
      throw new Error(`Failed to exchange Apple authorization code: ${errorData}`);
    }

    const tokenData = await tokenResponse.json() as AppleTokenResponse;
    console.log('[AppleNative] Token exchange successful');

    const verifiedPayload = await this.verifyAppleIdToken(tokenData.id_token, BUNDLE_ID);
    console.log('[AppleNative] ID token verified, sub:', verifiedPayload.sub);

    const userName = [givenName, familyName].filter(Boolean).join(' ') || '애플 사용자';

    return {
      provider: 'apple',
      providerUserId: verifiedPayload.sub,
      email: email || verifiedPayload.email || null,
      name: userName,
      profileImage: null,
    };
  }

  private generateAppleClientSecret(clientId: string, teamId: string, keyId: string, privateKey: string): string {
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + 86400 * 180;

    let formattedPrivateKey = privateKey;
    if (!formattedPrivateKey.includes('\n') && formattedPrivateKey.includes('\\n')) {
      formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, '\n');
    }
    if (!formattedPrivateKey.startsWith('-----BEGIN')) {
      formattedPrivateKey = `-----BEGIN PRIVATE KEY-----\n${formattedPrivateKey}\n-----END PRIVATE KEY-----`;
    }
    formattedPrivateKey = formattedPrivateKey.trim();
    console.log('[AppleAuth] Private key starts with:', formattedPrivateKey.substring(0, 30));
    console.log('[AppleAuth] Private key has newlines:', formattedPrivateKey.includes('\n'));

    const token = jwt.sign(
      {
        iss: teamId,
        iat: now,
        exp: expiry,
        aud: 'https://appleid.apple.com',
        sub: clientId,
      },
      formattedPrivateKey,
      {
        algorithm: 'ES256',
        keyid: keyId,
      }
    );

    return token;
  }
}
