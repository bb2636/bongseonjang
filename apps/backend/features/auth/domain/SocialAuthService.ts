import { SocialProvider } from '../../../entity/UserSocialAccount';

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

export interface SocialUserInfo {
  provider: SocialProvider;
  providerUserId: string;
  email: string | null;
  name: string;
  profileImage: string | null;
}

export class SocialAuthService {
  async getKakaoUserInfo(code: string): Promise<SocialUserInfo> {
    console.log('=== getKakaoUserInfo START ===');
    
    const clientId = process.env.KAKAO_REST_API_KEY;
    const clientSecret = process.env.KAKAO_CLIENT_SECRET;
    const baseUrl = process.env.SOCIAL_REDIRECT_BASE_URL;
    const redirectUri = `${baseUrl}/oauth/kakao/callback`;

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
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        code,
      }),
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

  async getNaverUserInfo(code: string, state: string): Promise<SocialUserInfo> {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

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

    if (!tokenResponse.ok) {
      throw new Error('Failed to get Naver access token');
    }

    const tokenData = await tokenResponse.json() as NaverTokenResponse;

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
}
