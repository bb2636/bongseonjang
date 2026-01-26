import { API_BASE_URL } from '../../../shared/config/apiConfig';

export type SocialProvider = 'kakao' | 'naver' | 'google' | 'apple';

export class AccountSuspendedError extends Error {
  code: string;
  constructor(message: string) {
    super(message);
    this.name = 'AccountSuspendedError';
    this.code = 'ACCOUNT_SUSPENDED';
  }
}

interface SocialLoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    profileImage: string | null;
    phone: string | null;
    isEmailVerified: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
  isNewUser: boolean;
}

interface SocialLoginRequiresEmailResponse {
  success: false;
  requiresEmail: true;
  tempData: {
    provider: SocialProvider;
    providerUserId: string;
    name: string;
    profileImage: string | null;
  };
}

type SocialLoginResult = SocialLoginResponse | SocialLoginRequiresEmailResponse;

interface AppleLoginParams {
  code: string;
  idToken?: string;
  userName?: string;
}

export async function socialLogin(
  provider: SocialProvider,
  code: string,
  state?: string,
  appleParams?: Omit<AppleLoginParams, 'code'>
): Promise<SocialLoginResult> {
  const body: Record<string, string | undefined> = { code, state };
  
  if (provider === 'apple' && appleParams) {
    body.idToken = appleParams.idToken;
    body.userName = appleParams.userName;
  }

  const response = await fetch(`${API_BASE_URL}/auth/social/${provider}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    if (data.code === 'ACCOUNT_SUSPENDED') {
      throw new AccountSuspendedError(data.message || '활동이 정지된 계정입니다.');
    }
    throw new Error(data.message || 'Social login failed');
  }

  return data;
}

export async function completeSocialLogin(
  provider: SocialProvider,
  providerUserId: string,
  email: string,
  name: string,
  profileImage: string | null
): Promise<SocialLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/social/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider,
      providerUserId,
      email,
      name,
      profileImage,
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Social login failed');
  }

  return response.json();
}

export function getKakaoAuthUrl(): string {
  const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    throw new Error('Kakao OAuth configuration is missing');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'profile_nickname profile_image account_email',
  });

  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
}

export function getNaverAuthUrl(): string {
  const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_NAVER_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    throw new Error('Naver OAuth configuration is missing');
  }

  const state = generateRandomState();
  sessionStorage.setItem('naver_oauth_state', state);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
  });

  return `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
}

function generateRandomState(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function isRequiresEmailResponse(
  response: SocialLoginResult
): response is SocialLoginRequiresEmailResponse {
  return 'requiresEmail' in response && response.requiresEmail === true;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  profileImage?: string | null;
  phone?: string | null;
}

export async function fetchUserProfile(token: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('사용자 정보를 불러오는데 실패했습니다.');
  }

  return response.json();
}
