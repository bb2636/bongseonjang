import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { checkIsCapacitor, CAPACITOR_APP_SCHEME, getApiBaseUrlDynamic, getCapacitorPlatform } from '@/shared/config/apiConfig';

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;
const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID;
const SOCIAL_REDIRECT_BASE_URL = import.meta.env.VITE_SOCIAL_REDIRECT_BASE_URL;

function getBackendBaseUrl(): string {
  const apiUrl = getApiBaseUrlDynamic();
  return apiUrl.replace(/\/api$/, '');
}

export interface OAuthResult {
  token?: string;
  refreshToken?: string;
  error?: string;
  isNewUser?: boolean;
  requiresEmail?: boolean;
  tempToken?: string;
  provider?: string;
  providerId?: string;
}

function storeOAuthState(provider: string, state: string): void {
  try {
    localStorage.setItem(`oauth_state_${provider}`, state);
    localStorage.setItem(`oauth_pending_provider`, provider);
  } catch (e) {
    console.warn('Failed to store OAuth state:', e);
  }
}

function validateAndClearOAuthState(provider: string, returnedState: string | null): boolean {
  try {
    const storedState = localStorage.getItem(`oauth_state_${provider}`);
    localStorage.removeItem(`oauth_state_${provider}`);
    localStorage.removeItem(`oauth_pending_provider`);
    
    if (!storedState || !returnedState) {
      console.warn('OAuth state validation: missing state');
      return false;
    }
    
    return storedState === returnedState;
  } catch (e) {
    console.warn('Failed to validate OAuth state:', e);
    return false;
  }
}

let oauthResolve: ((result: OAuthResult) => void) | null = null;
let deepLinkListenerRegistered = false;

function registerDeepLinkListener(): void {
  if (deepLinkListenerRegistered) return;
  deepLinkListenerRegistered = true;

  App.addListener('appUrlOpen', async (event) => {
    console.log('[DeepLink] App opened with URL:', event.url);
    
    const url = event.url;
    if (!url.startsWith(`${CAPACITOR_APP_SCHEME}://`)) {
      return;
    }

    try {
      await Browser.close();
    } catch (e) {
      console.log('[DeepLink] Browser already closed or error:', e);
    }

    try {
      const urlObj = new URL(url.replace(`${CAPACITOR_APP_SCHEME}://`, 'https://app/'));
      const pathname = urlObj.pathname;
      const params = new URLSearchParams(urlObj.search);

      const providerMatch = pathname.match(/\/oauth\/(\w+)\/callback/);
      if (!providerMatch) {
        console.warn('[DeepLink] Unknown callback path:', pathname);
        return;
      }

      const provider = providerMatch[1];
      console.log('[DeepLink] Processing callback for provider:', provider);

      const error = params.get('error');
      if (error) {
        localStorage.removeItem(`oauth_state_${provider}`);
        localStorage.removeItem(`oauth_pending_provider`);
        if (oauthResolve) {
          oauthResolve({ error });
          oauthResolve = null;
        }
        return;
      }

      const returnedState = params.get('state');
      if (!validateAndClearOAuthState(provider, returnedState)) {
        if (oauthResolve) {
          oauthResolve({ error: 'state_mismatch' });
          oauthResolve = null;
        }
        return;
      }

      const result: OAuthResult = {
        token: params.get('token') || undefined,
        refreshToken: params.get('refreshToken') || undefined,
        isNewUser: params.get('isNewUser') === 'true',
        requiresEmail: params.get('requiresEmail') === 'true',
        tempToken: params.get('tempToken') || undefined,
        provider: params.get('provider') || undefined,
        providerId: params.get('providerId') || undefined,
      };

      console.log('[DeepLink] OAuth result:', result);
      
      if (oauthResolve) {
        oauthResolve(result);
        oauthResolve = null;
      }
    } catch (e) {
      console.error('[DeepLink] Failed to parse callback URL:', e);
      if (oauthResolve) {
        oauthResolve({ error: 'parse_failed' });
        oauthResolve = null;
      }
    }
  });
}

async function openBrowserForOAuth(
  authUrl: string,
  provider: string,
  expectedState: string
): Promise<OAuthResult> {
  const platform = getCapacitorPlatform();
  console.log('[OAuth] === Starting OAuth with Browser ===');
  console.log('[OAuth] provider:', provider);
  console.log('[OAuth] platform:', platform);
  console.log('[OAuth] authUrl:', authUrl);

  registerDeepLinkListener();
  storeOAuthState(provider, expectedState);

  return new Promise(async (resolve) => {
    oauthResolve = resolve;

    const timeoutId = setTimeout(() => {
      if (oauthResolve === resolve) {
        console.log('[OAuth] Timeout reached, assuming user cancelled');
        localStorage.removeItem(`oauth_state_${provider}`);
        localStorage.removeItem(`oauth_pending_provider`);
        oauthResolve = null;
        resolve({ error: 'timeout' });
      }
    }, 5 * 60 * 1000);

    const originalResolve = resolve;
    oauthResolve = (result: OAuthResult) => {
      clearTimeout(timeoutId);
      originalResolve(result);
    };

    try {
      await Browser.open({
        url: authUrl,
        presentationStyle: 'popover',
        windowName: '_blank',
      });
      console.log('[OAuth] Browser opened successfully');
    } catch (err) {
      console.error('[OAuth] Failed to open browser:', err);
      clearTimeout(timeoutId);
      localStorage.removeItem(`oauth_state_${provider}`);
      localStorage.removeItem(`oauth_pending_provider`);
      oauthResolve = null;
      resolve({ error: 'browser_open_failed' });
    }
  });
}

let kakaoInitialized = false;

export function initKakaoSdk(): boolean {
  if (kakaoInitialized) {
    return true;
  }

  if (!KAKAO_JS_KEY) {
    console.error('VITE_KAKAO_JS_KEY is not configured');
    return false;
  }

  if (!window.Kakao) {
    console.error('Kakao SDK is not loaded');
    return false;
  }

  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_JS_KEY);
  }

  kakaoInitialized = window.Kakao.isInitialized();
  return kakaoInitialized;
}

export async function kakaoAuthorize(): Promise<OAuthResult | void> {
  const isCapacitor = checkIsCapacitor();
  console.log('[KakaoOAuth] kakaoAuthorize called, isCapacitor:', isCapacitor);
  
  if (isCapacitor) {
    const backendUrl = getBackendBaseUrl();
    const redirectUri = `${backendUrl}/api/auth/oauth/kakao/callback`;
    console.log('[KakaoOAuth] Capacitor mode, redirectUri:', redirectUri);
    const state = generateRandomState();
    
    const params = new URLSearchParams({
      client_id: KAKAO_REST_API_KEY || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'profile_nickname,profile_image,account_email',
      state,
    });

    const authUrl = `https://kauth.kakao.com/oauth/authorize?${params.toString()}&appScheme=${CAPACITOR_APP_SCHEME}`;
    console.log('[KakaoOAuth] authUrl:', authUrl);
    
    const result = await openBrowserForOAuth(authUrl, 'kakao', state);
    return result;
  }

  if (!initKakaoSdk()) {
    throw new Error('카카오 SDK 초기화에 실패했습니다.');
  }

  const redirectUri = `${SOCIAL_REDIRECT_BASE_URL}/oauth/kakao/callback`;

  window.Kakao.Auth.authorize({
    redirectUri,
    scope: 'profile_nickname,profile_image,account_email',
    throughTalk: false,
  });
}

export async function naverAuthorize(): Promise<OAuthResult | void> {
  const isCapacitor = checkIsCapacitor();
  console.log('[NaverOAuth] naverAuthorize called');
  console.log('[NaverOAuth] NAVER_CLIENT_ID:', NAVER_CLIENT_ID ? 'SET' : 'NOT SET');
  console.log('[NaverOAuth] isCapacitor:', isCapacitor);
  
  if (!NAVER_CLIENT_ID) {
    console.error('[NaverOAuth] VITE_NAVER_CLIENT_ID is not configured');
    throw new Error('네이버 로그인 설정이 올바르지 않습니다.');
  }

  const state = generateRandomState();

  if (isCapacitor) {
    console.log('[NaverOAuth] Capacitor mode - using SFSafariViewController');
    const backendUrl = getBackendBaseUrl();
    const redirectUri = `${backendUrl}/api/auth/oauth/naver/callback`;
    
    const params = new URLSearchParams({
      client_id: NAVER_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
    });

    const authUrl = `https://nid.naver.com/oauth2.0/authorize?${params.toString()}&appScheme=${CAPACITOR_APP_SCHEME}`;
    console.log('[NaverOAuth] authUrl:', authUrl);
    
    const result = await openBrowserForOAuth(authUrl, 'naver', state);
    console.log('[NaverOAuth] Browser result:', result);
    return result;
  }

  const redirectUri = `${SOCIAL_REDIRECT_BASE_URL}/oauth/naver/callback`;

  console.log('[Naver OAuth] === Authorize Request (Direct URL) ===');
  console.log('[Naver OAuth] client_id:', NAVER_CLIENT_ID);
  console.log('[Naver OAuth] redirect_uri:', redirectUri);
  console.log('[Naver OAuth] state:', state);

  const params = new URLSearchParams({
    client_id: NAVER_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
  });

  const authUrl = `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
  
  console.log('[Naver OAuth] Final authUrl:', authUrl);

  sessionStorage.setItem('naver_oauth_state', state);
  
  window.location.href = authUrl;
}

export async function googleAuthorize(): Promise<OAuthResult | void> {
  const isCapacitor = checkIsCapacitor();
  console.log('[GoogleOAuth] googleAuthorize called');
  console.log('[GoogleOAuth] GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
  console.log('[GoogleOAuth] isCapacitor:', isCapacitor);
  
  if (!GOOGLE_CLIENT_ID) {
    console.error('[GoogleOAuth] VITE_GOOGLE_CLIENT_ID is not configured');
    throw new Error('구글 로그인 설정이 올바르지 않습니다.');
  }

  const state = generateRandomState();

  if (isCapacitor) {
    console.log('[GoogleOAuth] Capacitor mode - using SFSafariViewController');
    const backendUrl = getBackendBaseUrl();
    const redirectUri = `${backendUrl}/api/auth/oauth/google/callback`;
    
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}&appScheme=${CAPACITOR_APP_SCHEME}`;
    console.log('[GoogleOAuth] authUrl:', authUrl);
    
    const result = await openBrowserForOAuth(authUrl, 'google', state);
    console.log('[GoogleOAuth] Browser result:', result);
    return result;
  }

  const redirectUri = `${SOCIAL_REDIRECT_BASE_URL}/oauth/google/callback`;
  sessionStorage.setItem('google_oauth_state', state);

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function appleAuthorize(): Promise<OAuthResult | void> {
  const isCapacitor = checkIsCapacitor();
  
  if (!APPLE_CLIENT_ID) {
    throw new Error('VITE_APPLE_CLIENT_ID is not configured');
  }

  const state = generateRandomState();

  if (isCapacitor) {
    const backendUrl = getBackendBaseUrl();
    const redirectUri = `${backendUrl}/api/auth/apple/callback`;
    const params = new URLSearchParams({
      client_id: APPLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code id_token',
      scope: 'name email',
      state,
      response_mode: 'form_post',
    });
    const authUrl = `https://appleid.apple.com/auth/authorize?${params.toString()}&appScheme=${CAPACITOR_APP_SCHEME}`;
    const result = await openBrowserForOAuth(authUrl, 'apple', state);
    return result;
  }

  const redirectUri = `${SOCIAL_REDIRECT_BASE_URL}/api/auth/apple/callback`;
  sessionStorage.setItem('apple_oauth_state', state);

  const params = new URLSearchParams({
    client_id: APPLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code id_token',
    scope: 'name email',
    state,
    response_mode: 'form_post',
  });

  window.location.href = `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}

function generateRandomState(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function getKakaoRedirectUri(): string {
  return `${SOCIAL_REDIRECT_BASE_URL}/oauth/kakao/callback`;
}

export function getNaverRedirectUri(): string {
  return `${SOCIAL_REDIRECT_BASE_URL}/oauth/naver/callback`;
}

export function getGoogleRedirectUri(): string {
  return `${SOCIAL_REDIRECT_BASE_URL}/oauth/google/callback`;
}

export function getAppleRedirectUri(): string {
  return `${SOCIAL_REDIRECT_BASE_URL}/oauth/apple/callback`;
}
